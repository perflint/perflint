#!/usr/bin/env node

var debug = (process.argv.indexOf('--debug') > -1)

// must do this initialization *before* other requires in order to work
if (debug) {
  require('debug').enable('perflint:*')
}

var cli = require('../lib/cli')

cli.interpret(process.argv, function(exitCode) {
  if ('exitCode' in process) {
    process.exitCode = exitCode
  } else {
    process.on('exit', function() {
      process.exit(exitCode)
    })
  }
})
