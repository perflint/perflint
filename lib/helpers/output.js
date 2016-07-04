/**
 * @fileoverview Output handlers
 * @author Matthew Harrison-Jones
 */
'use strict'

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var debug    = require('debug'),
    log      = require('../logging')

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

debug = debug('perflint:helpers')

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
  format = format || 'stylish'

  // only strings are valid formatters
  /* istanbul ignore else */
  if (typeof format === 'string') {
    debug(`Setting formatter: ${format}`)
    formatterPath = `../formatters/${format}`

    try {
      return require(formatterPath)
    } catch (ex) {
      return null
    }

  } else {
    return null
  }
}

/**
 * Prints results in specified formatter
 * @param {object} [results] The results to output in specidic style.
 * @param {string} [format] The chosen formatter to output in.
 * @returns {Function} False on error otherwise true
 */
function printResults(results, format) {
  const formatter = getFormatter(format)
  let output

  if (!formatter) {
    log.error(`Could not find formatter: ${format}`)
    return false
  }

  output = formatter(results)

  if (output) {
    log.info(output)
  }

  return true
}

/**
 * Return results in JSON format
 * @param {object} [results] The results to output in specidic style.
 * @param {string} [format] The chosen formatter to output in.
 * @returns {Function} False on error otherwise true
 */
function returnResults(results) {
  const formatter = getFormatter('json')
  const output = formatter(results)

  return output
}

module.exports = {
  getFormatter: getFormatter,
  printResults: printResults,
  returnResults: returnResults
}
