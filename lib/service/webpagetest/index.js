/**
 * @fileoverview Handle WebPageTest API
 * @author Matthew Harrison-Jones
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------
const Progress = require('progress')
let debug = require('debug')
const async = require('async')
const WebPageTest = require('webpagetest')
const chalk = require('chalk')
const log = require('../../logging')

const translateResults = require('./translate')

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------
debug = debug('perflint:wpt')

const wpt = {
  validateResults(err, res, config) {
    if (err) {
      /* istanbul ignore if */
      if (err.error && err.error.code === 'TIMEOUT') {
        log.error('Error: Test timed out.')
      } else {
        const isWptServer =
          config.server !== 'www.webpagetest.org'
            ? 'Please check server is a valid WebPageTest server'
            : ''
        log.error(
          `Error: Test request failed - ${isWptServer || err.statusText}`
        )
      }

      return 1
    }

    /* istanbul ignore if */
    if (res.statusCode !== 200) {
      log.error(`Error: ${res.statusText}`)
      return 1
    }

    debug(`Test Summary: ${res.data.summary}`)

    /* istanbul ignore if */
    if (config.info) {
      this.printInfo(res.data)
    }

    const parsed = translateResults(config, res.data)
    return {
      id: res.data.id,
      ...parsed
    }
  },

  getResults(config, cb) {
    const url = config.URL
    const { test } = config
    const { key } = config
    const { timeout } = config
    const requestTest = new WebPageTest(config.server, key)
    let bar = new Progress(
      chalk.bold.blue(`[:bar] :elapsed Timeout at ${timeout}s`),
      { total: timeout * 10, width: 40, clear: true }
    )

    const timer = setInterval(() => {
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
        const validated = this.validateResults(err, data, config)

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

      if (typeof url === 'string') {
        urls.push(url)
      } else {
        urls = url
      }

      async.eachSeries(
        urls,
        (site, done) => {
          debug(`Get WebPageTest results for: ${site}`)
          bar = new Progress(
            chalk.bold.blue(`[:bar] :elapsed Timeout at ${timeout}s`),
            { total: timeout * 10, width: 40, clear: true }
          )
          requestTest.runTest(
            site,
            {
              pollResults: 5,
              timeout,
              breakDown: true,
              domains: true,
              requests: false,
              pageSpeed: true,
              firstViewOnly: config.view === 'firstView',
              location: config.location,
              connectivity: config.connectivity,
              private: config.private,
              label: config.label
            },
            (err, data) => {
              bar.tick(timeout * 10)

              const validated = this.validateResults(err, data, config)

              if (err || validated === 1) {
                return done(err)
              }
              validatedResults.push(validated)
              return done()
            }
          )
        },
        (err) => {
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
    return null
  },

  printInfo(results) {
    debug('Outputting Summary')
    let output = '\n'

    output += `${chalk.underline('Details')}\n`
    output += `${chalk.dim('URL')}: ${chalk.yellow.bold(results.url)}\n`
    output += `${chalk.dim('ID')}: ${chalk.yellow.bold(results.id)}\n`
    output += `${chalk.dim('Location')}: ${chalk.yellow.bold(
      results.location
    )}\n`
    output += `${chalk.dim('Connectivity')}: ${chalk.yellow.bold(
      results.connectivity
    )}\n`
    output += `${chalk.dim('Latency')}: ${chalk.yellow.bold(
      results.latency
    )}\n\n`

    const {
      median: { firstView }
    } = results
    /* istanbul ignore else  */
    if (firstView) {
      output += `${chalk.underline('Pages')}\n`
      output += `${chalk.dim('Details')}: ${chalk.yellow.bold(
        results.median.firstView.pages.details
      )}\n`
      output += `${chalk.dim('Checklist')}: ${chalk.yellow.bold(
        results.median.firstView.pages.checklist
      )}\n`
      output += `${chalk.dim('Breakdown')}: ${chalk.yellow.bold(
        results.median.firstView.pages.breakdown
      )}\n`
      output += `${chalk.dim('Domains')}: ${chalk.yellow.bold(
        results.median.firstView.pages.domains
      )}\n`
      output += `${chalk.dim('Screenshot')}: ${chalk.yellow.bold(
        results.median.firstView.pages.screenShot
      )}\n`
    }

    log.info(output)
  }
}

module.exports = wpt
