/**
 * @fileoverview TAP reporter
 * @author Jonathan Kingston and Matthew Harrison-Jones
 */
'use strict'

var yaml = require('js-yaml')

//------------------------------------------------------------------------------
// Helper Functions
//------------------------------------------------------------------------------

/**
 * Returns a canonical error level string based upon the error message passed in.
 * @param {object} message Individual error message provided by eslint
 * @returns {String} Error level string
 */
function getMessageType(message) {
    if (message.severity === 2) {
        return 'error'
    } else {
        return 'warning'
    }
}

/**
 * Takes in a JavaScript object and outputs a TAP diagnostics string
 * @param {object} diagnostic JavaScript object to be embedded as YAML into output.
 * @returns {string} diagnostics string with YAML embedded - TAP version 13 compliant
 */
function outputDiagnostics(diagnostic) {
    var prefix = '  '
    var output = prefix + '---\n'

    output += prefix + yaml.safeDump(diagnostic).split('\n').join('\n' + prefix)
    output += '...\n'
    return output
}

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

module.exports = results => {
    let output = `TAP version 13\n1.. ${results.length}\n`

    results.forEach(function(result, id) {
        const messages = result.messages
        let testResult = 'ok',
            diagnostics = {}

        if (messages.length > 0) {
            testResult = 'not ok'

            messages.forEach(message => {
                const diagnostic = {
                    message: message.message,
                    severity: getMessageType(message),
                    data: {
                        actual: message.actual,
                        expected: message.min || message.max,
                        ruleId: message.ruleId || ''
                    }
                }

                // If we have multiple messages place them under a messages key
                // The first error will be logged as message key
                // This is to adhere to TAP 13 loosely defined specification of having a message key
                if ('message' in diagnostics) {
                    if (typeof diagnostics.messages === 'undefined') {
                        diagnostics.messages = []
                    }
                    diagnostics.messages.push(diagnostic)
                } else {
                    diagnostics = diagnostic
                }
            })
        }

        output += testResult + ' ' + (id + 1) + ' - ' + result.url + '\n'

        // If we have an error include diagnostics
        if (messages.length > 0) {
          output += outputDiagnostics(diagnostics)
        }

    })

    return output
}