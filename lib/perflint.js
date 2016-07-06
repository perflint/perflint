/**
 * @fileoverview Main PerfLint Object
 * @author Matthew Harrison-Jones
 */
'use strict'

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------
var wpt   = require('./service/webpagetest'),
    log   = require('./logging'),
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

    Object.keys(config.rules).forEach(key => {
      const rules = config.rules[key]

      for (let i = 0, len = raw.length; i < len; i++) {
        var messages = [],
            data = raw[i]

        for (let j = 0, len = rules.length; j < len; j++) {
          const rule = rules[j],
                metric = rule.metric,
                dataset = data[key],
                actualValue = metric.split('.').reduce((a, b) => a[b], dataset),
                logLevel = rule.severity

          let min, max, severity = 0

          if (logLevel === 'error') {
            severity = 2
          } else if (logLevel === 'warn') {
            severity = 1
          }

          if (typeof(actualValue) !== undefined) {
            if (rule.hasOwnProperty('min')) {
              min = rule.min

              if (actualValue < min) {
                messages.push({
                  ruleId: metric,
                  severity: severity,
                  actual: actualValue,
                  min: min,
                  message: `${rule.message} - is ${actualValue} should be greater than ${min}`
                })
              }
            } else if (rule.hasOwnProperty('max')){
              max = rule.max

              if (actualValue > max) {
                messages.push({
                  ruleId: metric,
                  severity: severity,
                  actual: actualValue,
                  max: max,
                  message: `${rule.message} - is ${actualValue} should not be greater than ${max}`
                })
              }
            } else {
              debug('No min or max specified')
            }
          } else {
            log.error(`No results for '${metric}' found`)
          }
        }

        stats = calculateStats(messages)

        results.push({
          url: data[key].url,
          summary: data[key].summary,
          messages,
          errorCount: stats.errorCount,
          warningCount: stats.warningCount
        })
      }
    })

    return {
      results,
      errorCount: stats.errorCount,
      warningCount: stats.warningCount
    }
  },

  lint(config) {
    return new Promise((resolve, reject) => {
      wpt.getResults(config)
        .catch(err => {
          debug('Error occured in when obtaining results')
          reject(err)
        })
        .then(results => {
          const parsed = perflint.parseResults(config, results)
          resolve(parsed)
        })
    })
  }
}

module.exports = perflint
