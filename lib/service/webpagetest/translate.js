//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------
let debug = require('debug')
const log = require('../../logging')

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------
debug = debug('perflint:wpt:results')

const translate = (config, results) => {
  debug('Converting WebPageTest results to common format')
  const { average, view } = config

  if (!results[average]) {
    log.error("Invalid 'average' specified in config")
    return 1
  }

  const filtered = results[average][view]

  if (!filtered) {
    log.error("Invalid 'view' specified in config")
    return 1
  }

  const { breakdown, ...rest } = filtered

  /* istanbul ignore next */
  return {
    requestsHTML: breakdown && breakdown.html ? breakdown.html : '',
    requestsJS: breakdown && breakdown.js ? breakdown.js : '',
    requestsCSS: breakdown && breakdown.css ? breakdown.css : '',
    requestsImage: breakdown && breakdown.image ? breakdown.image : '',
    requestsFlash: breakdown && breakdown.flash ? breakdown.flash : '',
    requestsFont: breakdown && breakdown.font ? breakdown.font : '',
    requestsOther: breakdown && breakdown.other ? breakdown.other : '',
    ...rest
  }
}

module.exports = translate
