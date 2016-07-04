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
    shjs     = require('shelljs'),
    options  = require('./options'),
    perflint = require('./perflint'),
    log      = require('./logging'),
    output   = require('./helpers/output'),
    defaultConf = require('./../config/perflint.json')

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
  const envs = getHomeDir()
  const proj = findFile('.perflintrc', fp)
  let home

  if (proj) {
    return proj
  }
  else if (envs) {
    home = path.normalize(path.join(envs, '.perflintrc'))
    /* istanbul ignore if */
    if (shjs.test('-e', home)) {
      return home
    }
  }

  return null
}

function getHomeDir() {
  let homePath = ''
  const environment = global.process.env
  const paths = [
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
const findFileResults = {}

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

  const filename = path.normalize(path.join(cwd, name))
  if (findFileResults[filename] !== undefined) {
    return findFileResults[filename]
  }

  const parent = path.resolve(cwd, '../')

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

//------------------------------------------------------------------------------
// Initialisation
//------------------------------------------------------------------------------

const command = {

  getConfig(path) {
    return command.loadConfig(findConfig(path))
  },

  loadConfig(file) {
    if (!file || !shjs.test('-e', file)) {
      log.error(`Can't find config file: ${'.perflintrc' || file}`)
      return 1
    }
    try {
      debug(`Parsing config: ${file}`)
      const config = JSON.parse(shjs.cat(file))
      config.dirname = path.dirname(file)
      return config
    } catch (err) {
      log.error(`Can't parse config file: ${file}\nError:${err}`)
      return 1
    }
  },

  interpret(args) {
    cli.setArgv(args)
    cli.options = {}

    cli.enable('version', 'glob', 'help')
    cli.setApp(path.resolve(`${__dirname}/../package.json`))

    const opts = cli.parse(options)

    // Set env variables as option
    if (process.env.PERFLINT_KEY) opts.key = process.env.PERFLINT_KEY
    if (process.env.PERFLINT_SERVER) opts.server = process.env.PERFLINT_SERVER

    let config
    if (opts.config) {
      config = command.getConfig(opts.config)
    } else {
      config = command.getConfig()
    }

    if (!config || config === 1) return 1
    const defaults = _.merge(defaultConf, opts)
    config = _.merge(defaults, config)

    debug('Checking arguments are valid')

    if (!config.key) {
      log.error('An API key for WebPageTest must be specified.')
      return 1
    }

    if (!config.URL && !config.test) {
      log.error('A URL or WebPageTest test ID must be specified.')
      return 1
    }

    /* istanbul ignore next */
    command.run(config)
      .then(code => {
        debug(`Exiting with code ${code}`)
        process.exit(code)
      })
  },

  run(config) {
    debug('Running...')
    return new Promise((resolve, reject) => {
      perflint.lint(config)
      .catch(err => {
        debug('Error occured when linting')
        reject(err)
      })
      .then(results => {
        /* istanbul ignore else */
        if (output.printResults(results.results, config.format)) {

          const tooManyWarnings = config.maxWarnings >= 0 && results.warningCount > config.maxWarnings

          if (!results.errorCount && tooManyWarnings) {
            log.error(`PerfLint found too many warnings (maximum: ${config.maxWarnings}).`)
          }

          resolve((results.errorCount || tooManyWarnings) ? 1 : 0)
        } else {
          debug('Print results failed.')
          reject('Print results failed.')
        }
      })
    })
  }
}
module.exports = command
