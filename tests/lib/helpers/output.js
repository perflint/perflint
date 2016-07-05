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
    proxyquire     = require('proxyquire')

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------
describe('helpers', () => {

  const log = {
    info() {},
    error() {}
  },
  helpers = proxyquire('../../../lib/helpers/output', { '../logging': log })

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
      const result = helpers.printResults(results, 'invalid')
      assert.isFalse(result)
      assert(log.error.calledOnce, 'should output error')
    })

    it('should output results', () => {
      const result = helpers.printResults(results, 'json')
      assert.isTrue(result)
      assert(log.info.calledOnce, 'should output info')
    })
  })
})
