/**
 * @fileoverview Available options in CLI
 * @author Matthew Harrison-Jones
 */
'use strict'

//------------------------------------------------------------------------------
// Initialisation
//------------------------------------------------------------------------------

var options = {
  'config': [ 'c', 'Use configuration from this file', 'file', false ],
  'timeout': [ 't', 'Define duration before timeout when obtaining results (seconds)', 'int', 120],
  'URL': [ 'u', 'Specify URL to run test against', 'url', false],
  'test': [ false, 'Obtain results from an existing WebPageTest test', 'string', false],
  'key': ['k', 'Specify API key for WebPageTest', 'string', false],
  'format': ['f', 'Define output format. Available options; stylish', 'string', 'stylish']
}

module.exports = options
