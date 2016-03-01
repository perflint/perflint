/**
 * @fileoverview Tests for CLI
 * @author Matthew Harrison-Jones
 */
'use-strict'

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------
var assert     = require('chai').assert,
    sinon      = require('sinon'),
    proxyquire = require('proxyquire')

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------
describe('cli', function() {

  var log = {
        info: sinon.spy(),
        error: sinon.spy()
      },
      cli = proxyquire('../../lib/cli', {
        './logging': log
      })

  describe('interpret()', function() {

    it('should return error when no API key for WebPageTest is specified', function() {
      var result = cli.interpret([ 'node', '/usr/local/bin/perflint' ])
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
})
