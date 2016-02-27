/**
 * @fileoverview Handle logging for PerfLint
 * @author Matthew Harrison-Jones
 */
'use strict'

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var chalk = require('chalk')

var logging = {
  error: function(msg) {
    console.error(chalk.bold.red(msg))
  },

  warn: function(msg) {
    console.log(chalk.bold.orange(msg))
  },

  log: function(msg) {
    console.log(msg)
  }
}

module.exports = logging
