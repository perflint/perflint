/**
 * @fileoverview JSON reporter
 * @author Matthew Harrison-Jones
 */
'use strict'

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

module.exports = function(results) {
  return JSON.stringify(results)
}
