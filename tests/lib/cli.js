/**
 * @fileoverview Tests for CLI
 * @author Matthew Harrison-Jones
 */
'use strict'

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
describe('cli', () => {

  const log = {
              info() {},
              error() {}
            },
        cli = proxyquire('../../lib/cli', { './logging': log })

  describe('getConfig()', () => {
    it('should return a config when provide a valid path', () => {
      const result = cli.getConfig(join(__dirname, '..', 'fixtures', 'config', 'wpt'))
      assert.isObject(result, 'Data is an object')
    })
  })

  describe('loadConfig()', () => {
    let sandbox

    beforeEach(() => {
      sandbox = sinon.sandbox.create()
      sandbox.spy(log, 'info')
      sandbox.spy(log, 'error')
    })

    afterEach(() => {
      sandbox.verifyAndRestore()
    })

    it('should return a config when provide a valid file', () => {
      const result = cli.loadConfig(join(__dirname, 'fixtures', 'config', 'wpt', '.perflint.json'))
      assert.isObject(result, 'Data is an object')
    })

    it('should return an error when provided a invalid file path', () => {
      const result = cli.loadConfig(join(__dirname, '..', 'fixtures', 'config', 'wpt', '.nonexistant'))
      assert(log.error.calledOnce, 'should output error')
      assert.equal(result, 1)
    })

    it('should return an error when config is invalid JSON', () => {
      const result = cli.loadConfig(join(__dirname, '..', 'fixtures', 'config', 'wpt', 'invalid.json'))
      assert(log.error.calledOnce, 'should output error')
      assert.equal(result, 1)
    })
  })

  describe('printResults()', () => {
    let sandbox

    const results = [{
      url: 'http://example.com',
      summary: 'Summary link',
      messages: [],
      errorCount: 0,
      warningCount: 0
    }]

    beforeEach(() => {
      sandbox = sinon.sandbox.create()
      sandbox.spy(log, 'info')
      sandbox.spy(log, 'error')
    })

    afterEach(() => {
      sandbox.verifyAndRestore()
    })

    it('should return an error is formatter does not exist', () => {
      const result = cli.printResults(results, 'invalid')
      assert.isFalse(result)
      assert(log.error.calledOnce, 'should output error')
    })

    it('should output results', () => {
      const result = cli.printResults(results, 'json')
      assert.isTrue(result)
      assert(log.info.calledOnce, 'should output info')
    })
  })

  describe('interpret()', () => {

    it('should return error when no API key for WebPageTest is specified', () => {
      const result = cli.interpret([ 'node', '/usr/local/bin/perflint', '-k', '' ])
      assert.equal(result, 1)
    })

    it('should return error when no URL or WebPageTest test ID is specified', () => {
      const result = cli.interpret([ 'node', '/usr/local/bin/perflint', '-k', 'somekey' ])
      assert.equal(result, 1)
    })

    it('should return error when no config can be found', () => {
      const result = cli.interpret([ 'node', '/usr/local/bin/perflint', '-u', 'example.com', '-c', '/tmp/', '-k', 'somekey' ])
      assert.equal(result, 1)
    })

  })

  describe('run()', () => {

    it('should return max warnings if too many', done => {
      defaultConfig.maxWarnings = 0
      defaultConfig.test = '160330_AJ_NRV'
      defaultConfig.rules = {
        'responses_404': [0, 'warning']
      }
      cli.run(defaultConfig, result => {
        assert.equal(result, 1)
        done()
      })

    })

    it('should return 1 if errors are found with flat rule', done => {
      defaultConfig.test = '160330_AJ_NRV'
      defaultConfig.rules = {
        'responses_404': [0, 'error']
      }
      cli.run(defaultConfig, result => {
        assert.equal(result, 1)
        done()
      })

    })

    it('should return 1 if errors are found with max rule', done => {
      defaultConfig.test = '160330_AJ_NRV'
      defaultConfig.rules = {
        'SpeedIndex': [{ 'max': 100 }, 'error']
      }
      cli.run(defaultConfig, result => {
        assert.equal(result, 1)
        done()
      })

    })

    it('should return 1 if errors are found with ranged rule', done => {
      defaultConfig.test = '160330_AJ_NRV'
      defaultConfig.rules = {
        'requestsDoc': [{ 'min': 3, 'max': 30 }, 'error']
      }
      cli.run(defaultConfig, result => {
        assert.equal(result, 1)
        done()
      })

    })

  })
})
