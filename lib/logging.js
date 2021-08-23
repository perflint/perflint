/* eslint-disable no-console */
/**
 * @fileoverview Handle logging for PerfLint
 * @author Matthew Harrison-Jones
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------
/* istanbul ignore next */
const chalk = require('chalk')

/* istanbul ignore next */
module.exports = {
  error: (msg) => {
    if (process.env.NODE_ENV !== 'TEST')
      console.error(`\n${chalk.bold.red(msg)}`)
  },

  warn: (msg) => {
    if (process.env.NODE_ENV !== 'TEST') console.log(chalk.bold.orange(msg))
  },

  info: (msg) => {
    if (process.env.NODE_ENV !== 'TEST') console.log(msg)
  }
}
