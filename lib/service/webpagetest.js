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
  return new Promise((resolve, reject) => {
    if (err) {
      /* istanbul ignore if */
      if (err.error && err.error.code === 'TIMEOUT') {
        log.error('Error: Test timed out.')
      } else {
        const isWptServer = config.server !== 'www.webpagetest.org' ? 'Please check server is a valid WebPageTest server' : ''
        log.error(`Error: Test request failed - ${isWptServer || err.statusText}`)
      }
      reject(err)
    }

    /* istanbul ignore if */
    if (data.statusCode !== 200) {
      log.error(`Error: ${data.statusText}`)
      reject(data.statusText)
    }

    debug(`Test Summary: ${data.data.summary}`)

    /* istanbul ignore if */
    if (config.info) {
      wpt.printInfo(config, data.data)
    }

    resolve({
      'webpagetest.pageSummary': data.data
    })
  })
}

var wpt = {
  getResults(config) {
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

    return new Promise((resolve, reject) => {
      /* istanbul ignore else  */
      if (test) {
        debug(`Get WebPageTest results for: ${test}`)
        requestTest.getTestResults(test, (err, data) => {
          bar.tick(timeout * 10)

          validateResults(err, data, config)
            .catch(err => {
              reject(err)
            })
            .then(validated => {
              resolve([validated])
            })
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

                validateResults(err, data, config)
                  .catch(err => {
                    done(err)
                  })
                  .then(validated => {
                    validatedResults.push(validated)
                    done()
                  })
              }
            )
          },
          err => {
            if (err) {
              reject(err)
            }
            resolve(validatedResults)
          }
        )
      } else {
        bar.tick(timeout * 10)
        reject('No test or URL specified')
      }
    })
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
