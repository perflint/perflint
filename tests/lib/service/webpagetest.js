/**
 * @fileoverview Tests for WebPageTest module
 * @author Matthew Harrison-Jones
 */
'use-strict'

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------
var assert     = require('chai').assert,
    chalk      = require('chalk'),
    proxyquire = require('proxyquire'),
    sinon      = require('sinon')

// Chalk protects its methods so we need to inherit from it
// for Sinon to work.
var chalkStub = Object.create(chalk, {
  dim: {
    value: function(str) {
      return chalk.dim(str)
    },
    writable: true
  },
  underline: {
    value: function(str) {
      return chalk.underline(str)
    },
    writable: true
  }
})

chalkStub.dim = chalk.dim
chalkStub.underline = chalk.underline

var wpt        = proxyquire('../../../lib/service/webpagetest', { chalk: chalkStub }),
defaultConfig  = require('../fixtures/config/wpt/.perflint.json'),
exampleResults = require('../fixtures/results/wpt/example.json')

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------
describe('WebPageTest', function() {
  var config = defaultConfig
  config.key = process.env.PERFLINT_KEY
  config.private = true

  describe('getResults()', function() {

    beforeEach(function() {
      // Reset config
      config.server = 'www.webpagetest.org'
      config.URL = 'http://example.com'
      delete config.test
    })

    it('should return results for new tests', function(done) {
      this.timeout(config.timeout * 2000)
      wpt.getResults(config, function(err, data) {
        assert.equal(err, null)
        assert.isObject(data, 'Data is an object')
        done()
      })
    })

    it('should return results for existing tests', function(done) {
      delete config.URL
      config.test = '160317_RP_N76'
      wpt.getResults(config, function(err, data) {
        assert.equal(err, null)
        assert.isObject(data, 'Data is an object')
        done()
      })
    })

    it('should return an error when an invalid server is defined', function(done) {
      config.server = 'www.invalidurl.com'
      wpt.getResults(config, function(err, data) {
        assert.equal(err, 1)
        assert.equal(data, null)
        done()
      })
    })

  })

  describe('translateResults()', function() {

    beforeEach(function() {
      // Reset config
      config.average = 'median'
      config.view = 'firstView'
    })

    it('should return error with invalid \'average\' in config', function() {
      config.average = 'invalidAverage'
      var res = wpt.translateResults(config, exampleResults)
      assert.equal(res, 1)
    })

    it('should return error with invalid \'view\' in config', function() {
      config.view = 'invalidView'
      var res = wpt.translateResults(config, exampleResults)
      assert.equal(res, 1)
    })

    it('should return formatted results', function() {
      var res = wpt.translateResults(config, exampleResults)
      assert.isObject(res, 'Data is an object')
    })

  })

  describe('printInfo()', function() {
    var sandbox,
        colorsEnabled = chalk.enabled

      beforeEach(function() {
        chalk.enabled = false
        sandbox = sinon.sandbox.create()
        sandbox.spy(chalkStub, 'underline')
        sandbox.spy(chalkStub, 'dim')
      })

      afterEach(function() {
        sandbox.verifyAndRestore()
        chalk.enabled = colorsEnabled
      })

    it('should return a string in the correct format', function() {
      wpt.printInfo(config, exampleResults)
      assert.equal(chalkStub.underline.callCount, 2)
      assert.equal(chalkStub.dim.callCount, 9)
    })


  })
})
