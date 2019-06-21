/**
 * @fileoverview JSON reporter
 * @author Matthew Harrison-Jones
 */

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

module.exports = (results) => {
  return JSON.stringify(results)
}
