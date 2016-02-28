/**
 * @fileoverview Main PerfLint Object
 * @author Matthew Harrison-Jones
 */
'use strict'

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------


//
// Helpers
//

var perflint = {
  lint: function() {
    var results = {},
        stats = {
          errorCount: 0,
          warningCount: 0
        }

    return {
      results: results,
      errorCount: stats.errorCount,
      warningCount: stats.warningCount
    }
  }
}

module.exports = perflint
