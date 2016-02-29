/**
 * @fileoverview Handle WebPageTest API
 * @author Matthew Harrison-Jones
 */
'use strict'

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------
var progress    = require('progress'),
    debug       = require('debug'),
    WebPageTest = require('webpagetest'),
    chalk       = require('chalk'),
    log         = require('./../logging')

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------
debug = debug('perflint:wpt')

var wpt = {
  translateResults: function(config, results) {
    debug('Converting WebPageTest results to common format')
    var filtered = results[config.average][config.view]
    return {
      URL: results.URL,
      summary: results.summary,
      loadTime: filtered.loadTime,
      TTFB: filtered.TTFB,
      bytesOut: filtered.bytesOut,
      bytesOutDoc: filtered.bytesOutDoc,
      bytesIn: filtered.bytesIn,
      bytesInDoc: filtered.bytesInDoc,
      connections: filtered.connections,
      requestsFull: filtered.requestsFull,
      requestsDoc: filtered.requestsDoc,
      responses_200: filtered.responses_200,
      responses_404: filtered.responses_404,
      responses_other: filtered.responses_other,
      result: filtered.result,
      render: filtered.render,
      fullyLoaded: filtered.fullyLoaded,
      cached: filtered.cached,
      docTime: filtered.docTime,
      domTime: filtered.domTime,
      score_cache: filtered.score_cache,
      score_cdn: filtered.score_cdn,
      score_gzip: filtered.score_gzip,
      score_cookies: filtered.score_cookies,
      score_keepAlive: filtered['score_keep-alive'],
      score_minify: filtered.score_minify,
      score_combine: filtered.score_combine,
      score_compress: filtered.score_compress,
      score_etags: filtered.score_etags,
      score_progressive_jpeg: filtered.score_progressive_jpeg,
      gzip_total: filtered.gzip_total,
      gzip_savings: filtered.gzip_savings,
      minify_total: filtered.minify_total,
      minify_savings: filtered.minify_savings,
      image_total: filtered.image_total,
      image_savings: filtered.image_savings,
      optimization_checked: filtered.optimization_checked,
      aft: filtered.aft,
      domElements: filtered.domElements,
      pageSpeedVersion: filtered.pageSpeedVersion,
      titleTime: filtered.titleTime,
      loadEventStart: filtered.loadEventStart,
      loadEventEnd: filtered.loadEventEnd,
      domContentLoadedEventStart: filtered.domContentLoadedEventStart,
      domContentLoadedEventEnd: filtered.domContentLoadedEventEnd,
      lastVisualChange: filtered.lastVisualChange,
      SpeedIndex: filtered.SpeedIndex,
      visualComplete: filtered.visualComplete,
      firstPaint: filtered.firstPaint,
      docCPUms: filtered.docCPUms,
      fullyLoadedCPUms: filtered.fullyLoadedCPUms,
      docCPUpct: filtered.docCPUpct,
      fullyLoadedCPUpct: filtered.fullyLoadedCPUpct,
      browser_process_count: filtered.browser_process_count,
      browser_main_memory_kb: filtered.browser_main_memory_kb,
      browser_other_private_memory_kb: filtered.browser_other_private_memory_kb,
      browser_working_set_kb: filtered.browser_working_set_kb,
      effectiveBps: filtered.effectiveBps,
      effectiveBpsDoc: filtered.effectiveBpsDoc
    }
  },

  getResults: function(config, cb) {
    var url = config.URL,
        test = config.test,
        key = config.key,
        timeout = config.timeout,
        requestTest = new WebPageTest('www.webpagetest.org', key),
        bar = new progress(chalk.bold.blue('[:bar] :elapsed Timeout at ' + timeout + 's'), { total: timeout * 10, width: 40, clear: true }),
        timer = setInterval(function () {
          bar.tick()
          if (bar.complete) {
            clearInterval(timer)
          }
        }, 100)

    debug('Get WebPageTest results for: ' + url)

    if (test) {
      requestTest.getTestResults(test, function (err, data) {
        if (err) throw err
        if (data.statusCode !== 200) {
          log.error('Error: ' + data.statusText)
          bar.tick(timeout * 10)
          cb(err, null)
        }
        bar.tick(timeout * 10)
        debug('Test Summary: ' + data.data.summary)
        var parsed = wpt.translateResults(config, data.data)
        cb(null, parsed)
      })
    } else if (url) {
      requestTest.runTest(url, { pollResults: 5, timeout: timeout, breakDown: true, domains:true, pageSpeed: true, firstViewOnly: (config.view === 'firstView') }, function (err, data) {
        if (err) {
          if (err.error.code === 'TIMEOUT') {
            log.error('Error: Test timed out.')
            cb(err, null)
          }

          throw err
        }
        if (data.statusCode !== 200) {
          log.error('Error: ' + data.statusText)
          bar.tick(timeout * 10)
          cb(err, null)
        }
        bar.tick(timeout * 10)
        debug('Test Summary: ' + data.data.summary)
        var parsed = wpt.translateResults(config, data.data)
        cb(null, parsed)
      })
    } else {
      return false
    }
  }
}

module.exports = wpt
