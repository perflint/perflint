/**
 * @fileoverview Handle CLI for PerfLint
 * @author Matthew Harrison-Jones & JSHint (https://github.com/jshint/jshint/blob/master/src/cli.js)
 */
'use strict'

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var cli     = require('cli'),
    fs      = require('fs'),
    path    = require('path'),
    exit    = require('exit'),
    shjs    = require('shelljs'),
    options = require('./options')

/*
 * Tries to find a configuration file in either project directory
 * or in the home directory. Configuration files are named
 * '.perflintrc'.
 *
 * @returns {string} a path to the config file
 */
function findConfig(fp) {
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
      cli.error('Can\'t find config file: ' + ('.perflintrc' || file))
      return 1
    }
    try {
      var config = JSON.parse(shjs.cat(file))
      config.dirname = path.dirname(file)
      return config
    } catch (err) {
      cli.error('Can\'t parse config file: ' + file + '\nError:' + err)
      return 1
    }
  },

  interpret: function(args) {
    cli.setArgv(args)
    cli.options = {}

    cli.enable('version', 'glob', 'help')
    cli.setApp(path.resolve(__dirname + '/../package.json'))

    var opts = cli.parse(options)

    if (!opts.URL && !opts.test) {
      cli.error('A URL or WebPageTest test ID must be specified.')
      return 1
    }

    var config
    if (opts.config) {
      config = command.getConfig(opts.config)
    } else {
      config = command.getConfig()
    }

    if (!config || config === 1) return 1

    command.run(opts, config)
  },

  run: function(opts, config) {
    console.log(opts, config)
  }
}
module.exports = command
