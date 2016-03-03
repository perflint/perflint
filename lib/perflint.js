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
  return messages.reduce(function(stat, message) {
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

var perflint = {
  parseResults: function(config, raw) {
    var stats = {
          errorCount: 0,
          warningCount: 0
        },
        results = [],
        rules = config.rules,
        messages = []

    Object.keys(rules).forEach(function(key) {
      var rule = rules[key],
          min,
          max,
          severity = 0,
          logLevel = rule[1],
          expected = rule[0]

      if (logLevel === 'error') {
        severity = 2
      } else if (logLevel === 'warning') {
        severity = 1
      }

      var actualValue = raw[key]

      if (actualValue) {
        if (typeof(expected) === 'object') {
          min = expected.min
          max = expected.max

          if (max && actualValue > max) {
            messages.push({
              ruleId: key,
              severity: severity,
              message: '\'' + key + '\' is ' + actualValue + ' should be less than ' + max
            })
          } else if (min && actualValue < min) {
            messages.push({
              ruleId: key,
              severity: severity,
              message: '\'' + key + '\' is ' + actualValue + ' should be greater than ' + min
            })
          }
        } else {
          if (actualValue !== expected) {
            messages.push({
              ruleId: key,
              severity: severity,
              message: '\'' + key + '\' is ' + actualValue + ' should be ' + expected
            })
          }
        }
      }
    })

    stats = calculateStats(messages)

    results.push({
      url: raw.URL,
      summary: raw.summary,
      messages: messages,
      errorCount: stats.errorCount,
      warningCount: stats.warningCount
    })

    return {
      results: results,
      errorCount: stats.errorCount,
      warningCount: stats.warningCount
    }
  },

  lint: function(config, cb) {
    wpt.getResults(config, function(err, stats){
        if (err) {
          cb(err, null)
          return 1
        }
        debug('Results obtained from WebPageTest')
        var results = perflint.parseResults(config, stats)
        cb(null, results)
        return 0
    })
  }
}

module.exports = perflint
