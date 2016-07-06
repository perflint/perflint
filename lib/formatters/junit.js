/**
 * @fileoverview jUnit Reporter
 * @author Jamund Ferguson and Matthew Harrison-Jones
 */
'use strict'

var escape = require('lodash.escape')

//------------------------------------------------------------------------------
// Helper Functions
//------------------------------------------------------------------------------

/**
 * Returns the severity of warning or error
 * @param {object} message message object to examine
 * @returns {string} severity level
 * @private
 */
function getMessageType(message) {
  if (message.severity === 2) {
    return 'Error'
  } else {
    return 'Warning'
  }
}

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

module.exports = results => {

  let output = ''

  output += '<?xml version="1.0" encoding="utf-8"?>\n'
  output += '<testsuites>\n'

  results.forEach(result => {

    const messages = result.messages

    if (messages.length) {
      output += `<testsuite package="org.perflint" time="0" tests="${messages.length}" errors="${messages.length}" name="${result.url}">\n`
    }

    messages.forEach(message => {
      const type = message.severity === 2 ? 'error' : 'failure'

      output += `<testcase time="0" name="org.perflint.${(message.ruleId || 'unknown')}">`
      output += `<${type} message="${escape(message.message || '')}">`
      output += '<![CDATA['
      output += `actual ${(message.actual)}, expected `
      output += `${(message.min || message.max)}, ${getMessageType(message)}`
      output += ` - ${escape(message.message || '')}`
      output += (message.ruleId ? ` (${message.ruleId})` : '')
      output += ']]>'
      output += `</${type}>`
      output += '</testcase>\n'
    })

    if (messages.length) {
      output += '</testsuite>\n'
    }

  })

  output += '</testsuites>\n'

  return output
}
