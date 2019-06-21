/**
 * @fileoverview Handle CLI for PerfLint
 * @author Matthew Harrison-Jones & JSHint (https://github.com/jshint/jshint/blob/master/src/cli.js)
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const cli = require('cli')
const fs = require('fs')
const path = require('path')
let debug = require('debug')
const _ = require('lodash')
const shjs = require('shelljs')
const options = require('./options')
const perflint = require('./perflint')
const log = require('./logging')
const defaultConf = require('./../config/perflint.json')

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

debug = debug('perflint:cli')

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
      break
    }
  }
  return homePath
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
 * @param {string} cwd  directory to start search from (default:
 *                      current working directory)
 *
 * @returns {string} normalized filename
 */
function findFile(name, cwd) {
  const dir = cwd || process.cwd()

  const filename = path.normalize(path.join(dir, name))
  if (findFileResults[filename] !== undefined) {
    return findFileResults[filename]
  }

  const parent = path.resolve(dir, '../')

  if (shjs.test('-e', filename)) {
    findFileResults[filename] = filename
    return filename
  }

  if (dir === parent) {
    findFileResults[filename] = null
    return null
  }

  return findFile(name, parent)
}

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
  if (envs) {
    home = path.normalize(path.join(envs, '.perflintrc'))
    /* istanbul ignore if */
    if (shjs.test('-e', home)) {
      return home
    }
  }

  return null
}

/**
 * Returns the formatter representing the given format or null if no formatter
 * with the given name can be found.
 * @param {string} [format] The name of the format to load or the path to a
 *      custom formatter.
 * @returns {Function} The formatter function or null if not found.
 */
function getFormatter(format) {
  let formatterPath

  // default is stylish
  const formatter = format || 'stylish'

  // only strings are valid formatters
  /* istanbul ignore else */
  if (typeof formatter === 'string') {
    debug(`Setting formatter: ${formatter}`)
    formatterPath = `./formatters/${formatter}`

    try {
      // eslint-disable-next-line
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

const command = {
  getConfig(p) {
    return command.loadConfig(findConfig(p))
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

  printResults(results, format) {
    const formatter = getFormatter(format)

    if (!formatter) {
      log.error(`Could not find formatter: ${format}`)
      return false
    }

    const output = formatter(results)

    if (output) {
      log.info(output)
    }

    return true
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
    return command.run(config, (code) => {
      debug(`Exiting with code ${code}`)
      process.exit(code)
    })
  },

  run(config, cb) {
    debug('Running...')
    perflint.lint(config, (err, results) => {
      /* istanbul ignore if */
      if (err) {
        debug('Error occured when linting')
        cb(1)
        return 1
      }

      /* istanbul ignore else */
      if (command.printResults(results.results, config.format)) {
        const tooManyWarnings =
          config.maxWarnings >= 0 && results.warningCount > config.maxWarnings

        if (!results.errorCount && tooManyWarnings) {
          log.error(
            `PerfLint found too many warnings (maximum: ${config.maxWarnings}).`
          )
        }

        cb(results.errorCount || tooManyWarnings ? 1 : 0)
      } else {
        debug('Print results failed.')
        cb(1)
        return 1
      }
      // Unknown error
      return 1
    })
  }
}
module.exports = command
