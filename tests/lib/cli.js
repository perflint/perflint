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
    defaultConfig  = require('./fixtures/config/perflint/.perflint.json')

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
      const result = cli.getConfig(join(__dirname, '..', 'fixtures', 'config', 'perflint'))
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
      const result = cli.loadConfig(join(__dirname, 'fixtures', 'config', 'perflint', '.perflint.json'))
      assert.isObject(result, 'Data is an object')
    })

    it('should return an error when provided a invalid file path', () => {
      const result = cli.loadConfig(join(__dirname, '..', 'fixtures', 'config', 'perflint', '.nonexistant'))
      assert(log.error.calledOnce, 'should output error')
      assert.equal(result, 1)
    })

    it('should return an error when config is invalid JSON', () => {
      const result = cli.loadConfig(join(__dirname, '..', 'fixtures', 'config', 'invalid.json'))
      assert(log.error.calledOnce, 'should output error')
      assert.equal(result, 1)
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
        'webpagetest.pageSummary': [
          {
            'metric': 'median.firstView.responses_404',
            'message': 'Too many 404 responses',
            'max': 0,
            'severity': 'warning',
            'unit': 'number'
          }
        ]
      }

      cli.run(defaultConfig)
        .then(result => {
          assert.equal(result, 1)
          done()
        })

    })

    it('should return 1 if errors are found with max rule', done => {
      defaultConfig.test = '160330_AJ_NRV'
      defaultConfig.rules = {
        'webpagetest.pageSummary': [
          {
            'metric': 'median.firstView.SpeedIndex',
            'message': 'SpeedIndex is too high',
            'max': 100,
            'severity': 'error',
            'unit': 'number'
          }
        ]
      }

      cli.run(defaultConfig)
        .then(result => {
          assert.equal(result, 1)
          done()
        })

    })

    it('should return 1 if errors are found with min rule', done => {
      defaultConfig.test = '160330_AJ_NRV'
      defaultConfig.rules = {
        'webpagetest.pageSummary': [
          {
            'metric': 'median.firstView.SpeedIndex',
            'message': 'SpeedIndex is too low',
            'min': 90000,
            'severity': 'error',
            'unit': 'number'
          }
        ]
      }

      cli.run(defaultConfig)
        .then(result => {
          assert.equal(result, 1)
          done()
        })

    })

  })
})
