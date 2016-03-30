/**
 * @fileoverview Tests for WebPageTest module
 * @author Matthew Harrison-Jones
 */
'use-strict'

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------
var assert        = require('chai').assert,
    wpt           = require('../../../lib/service/webpagetest'),
    defaultConfig = require('../fixtures/config/wpt/.perflint.json')

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------
describe('WebPageTest', function() {

  describe('getResults()', function() {
    var config = defaultConfig
    config.key = process.env.PERFLINT_KEY

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

    it('should return error with invalid \'average\' in config')

    it('should return error with invalid \'view\' in config')

    it('should return formatted results')

  })
})
