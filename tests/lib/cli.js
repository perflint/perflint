/**
 * @fileoverview Tests for CLI
 * @author Matthew Harrison-Jones
 */
'use-strict'

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------
var assert         = require('chai').assert,
    sinon          = require('sinon'),
    proxyquire     = require('proxyquire'),
    join           = require('path').join,
    defaultConfig  = require('./fixtures/config/wpt/.perflint.json')

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------
describe('cli', function() {

  var log = {
        info: function() {},
        error: function() {}
      },
      cli = proxyquire('../../lib/cli', { './logging': log })

  describe('getConfig()', function() {
    it('should return a config when provide a valid path', function() {
      var result = cli.getConfig(join(__dirname, '..', 'fixtures', 'config', 'wpt'))
      assert.isObject(result, 'Data is an object')
    })
  })

  describe('loadConfig()', function() {
    var sandbox

    beforeEach(function() {
      sandbox = sinon.sandbox.create()
      sandbox.spy(log, 'info')
      sandbox.spy(log, 'error')
    })

    afterEach(function() {
      sandbox.verifyAndRestore()
    })

    it('should return a config when provide a valid file', function() {
      var result = cli.loadConfig(join(__dirname, 'fixtures', 'config', 'wpt', '.perflint.json'))
      assert.isObject(result, 'Data is an object')
    })

    it('should return an error when provided a invalid file path', function() {
      var result = cli.loadConfig(join(__dirname, '..', 'fixtures', 'config', 'wpt', '.nonexistant'))
      assert(log.error.calledOnce, 'should output error')
      assert.equal(result, 1)
    })

    it('should return an error when config is invalid JSON', function() {
      var result = cli.loadConfig(join(__dirname, '..', 'fixtures', 'config', 'wpt', 'invalid.json'))
      assert(log.error.calledOnce, 'should output error')
      assert.equal(result, 1)
    })
  })

  describe('printResults()', function() {
    var sandbox,
        results = [{
          url: 'http://example.com',
          summary: 'Summary link',
          messages: [],
          errorCount: 0,
          warningCount: 0
        }]

    beforeEach(function() {
      sandbox = sinon.sandbox.create()
      sandbox.spy(log, 'info')
      sandbox.spy(log, 'error')
    })

    afterEach(function() {
      sandbox.verifyAndRestore()
    })

    it('should return an error is formatter does not exist', function() {
      var result = cli.printResults(results, 'invalid')
      assert.isFalse(result)
      assert(log.error.calledOnce, 'should output error')
    })

    it('should output results', function() {
      var result = cli.printResults(results, 'json')
      assert.isTrue(result)
      assert(log.info.calledOnce, 'should output info')
    })
  })

  describe('interpret()', function() {

    it('should return error when no API key for WebPageTest is specified', function() {
      var result = cli.interpret([ 'node', '/usr/local/bin/perflint', '-k', '' ])
      assert.equal(result, 1)
    })

    it('should return error when no URL or WebPageTest test ID is specified', function() {
      var result = cli.interpret([ 'node', '/usr/local/bin/perflint', '-k', 'somekey' ])
      assert.equal(result, 1)
    })

    it('should return error when no config can be found', function() {
      var result = cli.interpret([ 'node', '/usr/local/bin/perflint', '-u', 'example.com', '-c', '/tmp/', '-k', 'somekey' ])
      assert.equal(result, 1)
    })

  })

  describe('run()', function() {

    it('should return max warnings if too many', function(done) {
      defaultConfig.maxWarnings = 0
      defaultConfig.test = '160330_AJ_NRV'
      defaultConfig.rules = {
        'responses_404': [0, 'warning']
      }
      cli.run(defaultConfig, function(result) {
        assert.equal(result, 1)
        done()
      })

    })

  })
})
