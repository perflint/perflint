/**
 * @fileoverview Main PerfLint Object
 * @author Matthew Harrison-Jones
 */
'use strict'

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------
var wpt   = require('./service/webpagetest'),
    debug = require('debug')

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------
debug = debug('perflint:main')

/**
 * It will calculate the error and warning count for collection of messages per file
 * @param {Object[]} messages - Collection of messages
 * @returns {Object} Contains the stats
 * @private
 */
function calculateStats(messages) {
  return messages.reduce((stat, message) => {
    if (message.severity === 2) {
      stat.errorCount++
    } else {
        stat.warningCount++
    }
    return stat
  }, {
    errorCount: 0,
    warningCount: 0
  })
}

const perflint = {
  parseResults(config, raw) {
    let stats = {
          errorCount: 0,
          warningCount: 0
        }

    const results = []
    const rules = config.rules

    for (let i = 0, len = raw.length; i < len; i++) {
      const messages = [], data = raw[i]

      Object.keys(rules).forEach(key => {
        const rule = rules[key]
        let min
        let max
        let severity = 0
        const logLevel = rule[1]
        const expected = rule[0]

        if (logLevel === 'error') {
          severity = 2
        } else if (logLevel === 'warning') {
          severity = 1
        }

        const actualValue = data[key]

        if (actualValue) {
          if (typeof(expected) === 'object') {
            min = expected.min
            max = expected.max

            if (max && actualValue > max) {
              messages.push({
                ruleId: key,
                severity,
                message: `'${key}' is ${actualValue} should be less than ${max}`
              })
            } else if (min && actualValue < min) {
              messages.push({
                ruleId: key,
                severity,
                message: `'${key}' is ${actualValue} should be greater than ${min}`
              })
            }
          } else {
            if (actualValue !== expected) {
              messages.push({
                ruleId: key,
                severity,
                message: `'${key}' is ${actualValue} should be ${expected}`
              })
            }
          }
        }
      })

      stats = calculateStats(messages)

      results.push({
        url: data.URL,
        summary: data.summary,
        messages,
        errorCount: stats.errorCount,
        warningCount: stats.warningCount
      })
    }

    return {
      results,
      errorCount: stats.errorCount,
      warningCount: stats.warningCount
    }
  },

  lint(config, cb) {
    wpt.getResults(config, (err, results) => {

        /* istanbul ignore if */
        if (err) {
          debug('Error occured in when obtaining results')
          cb(err, null)
          return 1
        }

        debug('Results obtained from WebPageTest')
        const parsed = perflint.parseResults(config, results)
        cb(null, parsed)
        return 0
    })
  }
}

module.exports = perflint
