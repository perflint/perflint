/**
 * @fileoverview Handle CLI for PerfLint
 * @author Matthew Harrison-Jones & JSHint (https://github.com/jshint/jshint/blob/master/src/cli.js)
 */
'use strict'

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var cli      = require('cli'),
    fs       = require('fs'),
    path     = require('path'),
    debug    = require('debug'),
    _        = require('lodash'),
    exit     = require('exit'),
    shjs     = require('shelljs'),
    options  = require('./options'),
    perflint = require('./perflint'),
    log      = require('./logging')

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

debug = debug('perflint:cli')

/*
 * Tries to find a configuration file in either project directory
 * or in the home directory. Configuration files are named
 * '.perflintrc'.
 *
 * @returns {string} a path to the config file
 */
function findConfig(fp) {
  debug('Finding config')
  var envs = getHomeDir(),
      proj = findFile('.perflintrc', fp),
      home

  if (proj) {
    return proj
  }
  else if (envs) {
    home = path.normalize(path.join(envs, '.perflintrc'))
    if (shjs.test('-e', home)) {
      return home
    }
  }

  return null
}

function getHomeDir() {
  var homePath = ''
  var environment = global.process.env
  var paths = [
    environment.USERPROFILE,
    environment.HOME,
    environment.HOMEPATH,
    environment.HOMEDRIVE + environment.HOMEPATH
  ]

  while (paths.length) {
    homePath = paths.shift()
    if (fs.existsSync(homePath)) {
      return homePath
    }
  }
}

// Storage for memoized results from find file
// Should prevent lots of directory traversal &
// lookups when liniting an entire project
var findFileResults = {}

/**
 * Searches for a file with a specified name starting with
 * 'dir' and going all the way up either until it finds the file
 * or hits the root.
 *
 * @param {string} name filename to search for (e.g. .perflintrc)
 * @param {string} dir  directory to start search from (default:
 *                      current working directory)
 *
 * @returns {string} normalized filename
 */
function findFile(name, cwd) {
  cwd = cwd || process.cwd()

  var filename = path.normalize(path.join(cwd, name))
  if (findFileResults[filename] !== undefined) {
    return findFileResults[filename]
  }

  var parent = path.resolve(cwd, '../')

  if (shjs.test('-e', filename)) {
    findFileResults[filename] = filename
    return filename
  }

  if (cwd === parent) {
    findFileResults[filename] = null
    return null
  }

  return findFile(name, parent)
}

/**
 * Returns the formatter representing the given format or null if no formatter
 * with the given name can be found.
 * @param {string} [format] The name of the format to load or the path to a
 *      custom formatter.
 * @returns {Function} The formatter function or null if not found.
 */
function getFormatter(format) {

    var formatterPath

    // default is stylish
    format = format || 'stylish'

    // only strings are valid formatters
    if (typeof format === 'string') {
        debug('Setting formatter: ' + format)
        formatterPath = './formatters/' + format

        try {
          return require(formatterPath)
        } catch (ex) {
          return null
        }

    } else {
        return null
    }
}

//------------------------------------------------------------------------------
// Initialisation
//------------------------------------------------------------------------------

var command = {
  /* istanbul ignore next */
  exit: exit,

  getConfig: function(path) {
    return command.loadConfig(findConfig(path))
  },

  loadConfig: function(file) {
    if (!file || !shjs.test('-e', file)) {
      log.error('Can\'t find config file: ' + ('.perflintrc' || file))
      return 1
    }
    try {
      debug('Parsing config: ' + file)
      var config = JSON.parse(shjs.cat(file))
      config.dirname = path.dirname(file)
      return config
    } catch (err) {
      log.error('Can\'t parse config file: ' + file + '\nError:' + err)
      return 1
    }
  },

  printResults: function(results, format) {
    var formatter = getFormatter(format),
        output

    if (!formatter) {
      log.error('Could not find formatter: ' + format)
      return false
    }
    output = formatter(results)

    if (output) {
      log.info(output)
    }

    return true
  },

  interpret: function(args, exit) {
    cli.setArgv(args)
    cli.options = {}

    cli.enable('version', 'glob', 'help')
    cli.setApp(path.resolve(__dirname + '/../package.json'))

    var opts = cli.parse(options)

    debug('Checking arguments are valid')
    if (!opts.key || process.env.PERFLINT_KEY) {
      log.error('An API key for WebPageTest must be specified.')
      return 1
    }

    if (!opts.URL && !opts.test) {
      log.error('A URL or WebPageTest test ID must be specified.')
      return 1
    }

    // Set env variables as option
    if (process.env.PERFLINT_KEY) opts.key = process.env.PERFLINT_KEY
    if (process.env.PERFLINT_SERVER) opts.server = process.env.PERFLINT_SERVER

    var config
    if (opts.config) {
      config = command.getConfig(opts.config)
    } else {
      config = command.getConfig()
    }

    if (!config || config === 1) return 1
    config = _.assign(opts, config)

    command.run(config, function(code) {
      exit(code)
    })
  },

  run: function(config, cb) {
    debug('Running...')
    perflint.lint(config, function(err, results) {
      if (err) {
        cb(1)
        return 1
      }
      if (command.printResults(results.results, config.format)) {

        var tooManyWarnings = config.maxWarnings >= 0 && results.warningCount > config.maxWarnings

        if (!results.errorCount && tooManyWarnings) {
          log.error('PerfLint found too many warnings (maximum: ' + config.maxWarnings + ').')
        }

        cb((results.errorCount || tooManyWarnings) ? 1 : 0)
      } else {
        debug('Print results failed.')
        cb(1)
      }
    })
  }
}
module.exports = command
