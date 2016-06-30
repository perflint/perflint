/**
 * @fileoverview Available options in CLI
 * @author Matthew Harrison-Jones
 */
'use strict'

//------------------------------------------------------------------------------
// Initialisation
//------------------------------------------------------------------------------

const options = {
  'debug': ['d', 'Enable debugging', 'string', false],
  'config': [ 'c', 'Use configuration from this file', 'file', false ],
  'timeout': [ 't', 'Define duration before timeout when obtaining results (seconds)', 'int', 120],
  'URL': [ 'u', 'Specify URL to run test against', 'url', false],
  'test': [ false, 'Obtain results from an existing WebPageTest test', 'string', false],
  'key': ['k', 'Specify API key for WebPageTest', 'string', false],
  'format': ['f', 'Define output format. Available options; stylish', 'string', 'stylish'],
  'maxWarnings': ['w', 'Number of warnings to trigger nonzero exit code', 'int', -1],
  'server': ['s', 'Define the WebPageTest server URL', 'string', 'www.webpagetest.org'],
  'info': ['i', 'Display test information on completion', 'boolean', false]
}

module.exports = options
