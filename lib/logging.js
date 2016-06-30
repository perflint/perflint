/**
 * @fileoverview Handle logging for PerfLint
 * @author Matthew Harrison-Jones
 */
'use strict'

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------
/* istanbul ignore next */
var chalk = require('chalk')

/* istanbul ignore next */
module.exports = {
  error: function(msg) {
    console.error('\n' + chalk.bold.red(msg))
  },

  warn(msg) {
    console.log(chalk.bold.orange(msg))
  },

  info(msg) {
    console.log(msg)
  }
}
