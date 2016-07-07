'use strict'

/**
 * @fileoverview Tests for WebPageTest module
 * @author Matthew Harrison-Jones
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------
var assert     = require('chai').assert,
    chalk      = require('chalk'),
    proxyquire = require('proxyquire'),
    sinon      = require('sinon')

// Chalk protects its methods so we need to inherit from it
// for Sinon to work.
const chalkStub = Object.create(chalk, {
  dim: {
    value(str) {
      return chalk.dim(str)
    },
    writable: true
  },
  underline: {
    value(str) {
      return chalk.underline(str)
    },
    writable: true
  }
})

chalkStub.dim = chalk.dim
chalkStub.underline = chalk.underline

var wpt        = proxyquire('../../../lib/service/webpagetest', { chalk: chalkStub }),
defaultConfig  = require('../fixtures/config/perflint/.perflint.json'),
exampleResults = require('../fixtures/results/wpt/example.json')

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------
describe('WebPageTest', () => {
  const config = defaultConfig
  config.key = process.env.PERFLINT_KEY
  config.private = true

  describe('getResults()', () => {

    beforeEach(() => {
      // Reset config
      config.server = 'www.webpagetest.org'
      config.URL = 'http://example.com'
      delete config.test
    })

    it('should return results for new tests', function(done) {
      this.timeout(config.timeout * 2000)
      wpt.getResults(config)
        .then((data) => {
          assert.isObject(data[0], 'Data is an object')
          done()
        })
    })

    it('should return results for existing tests', done => {
      delete config.URL
      config.test = '160317_RP_N76'
      wpt.getResults(config)
        .then((data) => {
          assert.isObject(data[0], 'Data is an object')
          done()
        })
    })

    it('should return an error when an invalid server is defined', done => {
      config.server = 'www.invalidurl.com'
      wpt.getResults(config)
        .catch(err => {
          assert.isDefined(err)
          done()
        })
    })

    it('should return an error when an invalid server and a test is defined', done => {
      delete config.URL
      config.server = 'www.invalidurl.com'
      config.test = '160317_RP_N76'
      wpt.getResults(config)
        .catch(err => {
          assert.isDefined(err)
          done()
        })
    })

  })

  describe('printInfo()', () => {
    let sandbox
    const colorsEnabled = chalk.enabled

    beforeEach(() => {
      chalk.enabled = false
      sandbox = sinon.sandbox.create()
      sandbox.spy(chalkStub, 'underline')
      sandbox.spy(chalkStub, 'dim')
    })

    afterEach(() => {
      sandbox.verifyAndRestore()
      chalk.enabled = colorsEnabled
    })

    it('should return a string in the correct format', () => {
      wpt.printInfo(config, exampleResults)
      assert.equal(chalkStub.underline.callCount, 2)
      assert.equal(chalkStub.dim.callCount, 10)
    })
  })
})
