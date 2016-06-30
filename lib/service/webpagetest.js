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
    async       = require('async'),
    WebPageTest = require('webpagetest'),
    chalk       = require('chalk'),
    log         = require('./../logging')

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------
debug = debug('perflint:wpt')

function validateResults(err, data, config) {
  if (err) {
    /* istanbul ignore if */
    if (err.error && err.error.code === 'TIMEOUT') {
      log.error('Error: Test timed out.')
    } else {
      const isWptServer = config.server !== 'www.webpagetest.org' ? 'Please check server is a valid WebPageTest server' : ''
      log.error(`Error: Test request failed - ${isWptServer || err.statusText}`)
    }

    return 1
  }

  /* istanbul ignore if */
  if (data.statusCode !== 200) {
    log.error(`Error: ${data.statusText}`)
    return 1
  }

  debug(`Test Summary: ${data.data.summary}`)

  /* istanbul ignore if */
  if (config.info) {
    wpt.printInfo(config, data.data)
  }

  const parsed = wpt.translateResults(config, data.data)
  return parsed
}

var wpt = {
  translateResults(config, results) {
    debug('Converting WebPageTest results to common format')
    const average = config.average, view = config.view

    if (!results[config.average]) {
      log.error('Invalid \'average\' specified in config')
      return 1
    }
    if (!results[config.average][config.view]) {
      log.error('Invalid \'view\' specified in config')
      return 1
    }

    const filtered = results[average][view]

    /* istanbul ignore next */
    return {
      URL: results.url,
      summary: results.summary,
      loadTime: filtered.loadTime ? filtered.loadTime : '',
      TTFB: filtered.TTFB ? filtered.TTFB : '',
      bytesOut: filtered.bytesOut ? filtered.bytesOut : '',
      bytesOutDoc: filtered.bytesOutDoc ? filtered.bytesOutDoc : '',
      bytesIn: filtered.bytesIn ? filtered.bytesIn : '',
      bytesInDoc: filtered.bytesInDoc ? filtered.bytesInDoc : '',
      connections: filtered.connections ? filtered.connections : '',
      requestsFull: filtered.requestsFull ? filtered.requestsFull : '',
      requestsDoc: filtered.requestsDoc ? filtered.requestsDoc : '',
      requestsHTML: filtered.breakdown && filtered.breakdown.html ? filtered.breakdown.html : '',
      requestsJS: filtered.breakdown && filtered.breakdown.js ? filtered.breakdown.js : '',
      requestsCSS: filtered.breakdown && filtered.breakdown.css ? filtered.breakdown.css : '',
      requestsImage: filtered.breakdown && filtered.breakdown.image ? filtered.breakdown.image : '',
      requestsFlash: filtered.breakdown && filtered.breakdown.flash ? filtered.breakdown.flash : '',
      requestsFont: filtered.breakdown && filtered.breakdown.font ? filtered.breakdown.font : '',
      requestsOther: filtered.breakdown && filtered.breakdown.other ? filtered.breakdown.other : '',
      responses_200: filtered.responses_200 ? filtered.responses_200 : '',
      responses_404: filtered.responses_404 ? filtered.responses_404 : '',
      responses_other: filtered.responses_other ? filtered.responses_other : '',
      result: filtered.result ? filtered.result : '',
      render: filtered.render ? filtered.render : '',
      fullyLoaded: filtered.fullyLoaded ? filtered.fullyLoaded : '',
      cached: filtered.cached ? filtered.cached : '',
      docTime: filtered.docTime ? filtered.docTime : '',
      domTime: filtered.domTime ? filtered.domTime : '',
      score_cache: filtered.score_cache ? filtered.score_cache : '',
      score_cdn: filtered.score_cdn ? filtered.score_cdn : '',
      score_gzip: filtered.score_gzip ? filtered.score_gzip : '',
      score_cookies: filtered.score_cookies ? filtered.score_cookies : '',
      score_keepAlive: filtered['score_keep-alive'],
      score_minify: filtered.score_minify ? filtered.score_minify : '',
      score_combine: filtered.score_combine ? filtered.score_combine : '',
      score_compress: filtered.score_compress ? filtered.score_compress : '',
      score_etags: filtered.score_etags ? filtered.score_etags : '',
      score_progressive_jpeg: filtered.score_progressive_jpeg ? filtered.score_progressive_jpeg : '',
      gzip_total: filtered.gzip_total ? filtered.gzip_total : '',
      gzip_savings: filtered.gzip_savings ? filtered.gzip_savings : '',
      minify_total: filtered.minify_total ? filtered.minify_total : '',
      minify_savings: filtered.minify_savings ? filtered.minify_savings : '',
      image_total: filtered.image_total ? filtered.image_total : '',
      image_savings: filtered.image_savings ? filtered.image_savings : '',
      optimization_checked: filtered.optimization_checked ? filtered.optimization_checked : '',
      aft: filtered.aft ? filtered.aft : '',
      domElements: filtered.domElements ? filtered.domElements : '',
      pageSpeedVersion: filtered.pageSpeedVersion ? filtered.pageSpeedVersion : '',
      titleTime: filtered.titleTime ? filtered.titleTime : '',
      loadEventStart: filtered.loadEventStart ? filtered.loadEventStart : '',
      loadEventEnd: filtered.loadEventEnd ? filtered.loadEventEnd : '',
      domContentLoadedEventStart: filtered.domContentLoadedEventStart ? filtered.domContentLoadedEventStart : '',
      domContentLoadedEventEnd: filtered.domContentLoadedEventEnd ? filtered.domContentLoadedEventEnd : '',
      lastVisualChange: filtered.lastVisualChange ? filtered.lastVisualChange : '',
      SpeedIndex: filtered.SpeedIndex ? filtered.SpeedIndex : '',
      visualComplete: filtered.visualComplete ? filtered.visualComplete : '',
      firstPaint: filtered.firstPaint ? filtered.firstPaint : '',
      docCPUms: filtered.docCPUms ? filtered.docCPUms : '',
      fullyLoadedCPUms: filtered.fullyLoadedCPUms ? filtered.fullyLoadedCPUms : '',
      docCPUpct: filtered.docCPUpct ? filtered.docCPUpct : '',
      fullyLoadedCPUpct: filtered.fullyLoadedCPUpct ? filtered.fullyLoadedCPUpct : '',
      browser_process_count: filtered.browser_process_count ? filtered.browser_process_count : '',
      browser_main_memory_kb: filtered.browser_main_memory_kb ? filtered.browser_main_memory_kb : '',
      browser_other_private_memory_kb: filtered.browser_other_private_memory_kb ? filtered.browser_other_private_memory_kb : '',
      browser_working_set_kb: filtered.browser_working_set_kb ? filtered.browser_working_set_kb : '',
      effectiveBps: filtered.effectiveBps ? filtered.effectiveBps : '',
      effectiveBpsDoc: filtered.effectiveBpsDoc ? filtered.effectiveBpsDoc : ''
    }
  },

  getResults(config, cb) {
    const url = config.URL
    const test = config.test
    const key = config.key
    const timeout = config.timeout
    const requestTest = new WebPageTest(config.server, key)
    let bar = new progress(chalk.bold.blue(`[:bar] :elapsed Timeout at ${timeout}s`), { total: timeout * 10, width: 40, clear: true })

    let timer = setInterval(() => {
      bar.tick()
      if (bar.complete) {
        clearInterval(timer)
      }
    }, 100)

    /* istanbul ignore else  */
    if (test) {
      debug(`Get WebPageTest results for: ${test}`)
      requestTest.getTestResults(test, (err, data) => {
        bar.tick(timeout * 10)

        const validated = validateResults(err, data, config)

        /* istanbul ignore if  */
        if (err || validated === 1) {
          cb(1, null)
          return 1
        }

        cb(null, [validated])
        return 0

      })
    } else if (url) {
      let urls = []
      const validatedResults = []

      if (typeof(url) === 'string') {
        urls.push(url)
      } else {
        urls = url
      }

      async.eachSeries(urls,
        (site, done) => {
          debug(`Get WebPageTest results for: ${site}`)
          bar = new progress(`${chalk.underline(site)}: ${chalk.bold.blue('[:bar] :elapsed Timeout at ' + timeout + 's')}`, { total: timeout * 10, width: 40, clear: true }),
          timer = setInterval(() => {
            bar.tick()
            if (bar.complete) {
              clearInterval(timer)
            }
          }, 100)
          requestTest.runTest(site,
            {
              pollResults: 5,
              timeout,
              breakDown: true,
              domains: true,
              requests: false,
              pageSpeed: true,
              firstViewOnly: (config.view === 'firstView'),
              location: config.location,
              connectivity: config.connectivity,
              private: config.private,
              label: config.label
            },
            (err, data) => {
              bar.tick(timeout * 10)

              const validated = validateResults(err, data, config)

              if (err || validated === 1) {
                done(err)
              }
              validatedResults.push(validated)
              done()
            }
          )
        },
        err => {
          if (err) {
            cb(1, null)
            return 1
          }
          cb(null, validatedResults)
          return 0
        }
      )
    } else {
      bar.tick(timeout * 10)
      cb(1, null)
      return 1
    }
  },

  printInfo(config, results) {
    debug('Outputting Summary')
    let output = '\n'

    output += `${chalk.underline('Details')}\n`
    output += `${chalk.dim('URL')}: ${chalk.yellow.bold(results.url)}\n`,
    output += `${chalk.dim('ID')}: ${chalk.yellow.bold(results.id)}\n`,
    output += `${chalk.dim('Location')}: ${chalk.yellow.bold(results.location)}\n`,
    output += `${chalk.dim('Connectivity')}: ${chalk.yellow.bold(results.connectivity)}\n`,
    output += `${chalk.dim('Latency')}: ${chalk.yellow.bold(results.latency)}\n\n`

    /* istanbul ignore else  */
    if (results.median.firstView) {
      output += `${chalk.underline('Pages')}\n`
      output += `${chalk.dim('Details')}: ${chalk.yellow.bold(results.median.firstView.pages.details)}\n`,
      output += `${chalk.dim('Checklist')}: ${chalk.yellow.bold(results.median.firstView.pages.checklist)}\n`,
      output += `${chalk.dim('Breakdown')}: ${chalk.yellow.bold(results.median.firstView.pages.breakdown)}\n`,
      output += `${chalk.dim('Domains')}: ${chalk.yellow.bold(results.median.firstView.pages.domains)}\n`,
      output += `${chalk.dim('Screenshot')}: ${chalk.yellow.bold(results.median.firstView.pages.screenShot)}\n`
    }

    log.info(output)
  }
}

module.exports = wpt
