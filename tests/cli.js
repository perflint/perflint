/**
 * @fileoverview Tests for CLI
 * @author Matthew Harrison-Jones
 */
'use-strict'

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------
var assert = require('chai').assert,
    cli = require('../lib/cli')

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------
describe('cli', function() {
  describe('interpret()', function() {
        it('should return error when no URL or WebPageTest test ID is specified', function() {
            var result = cli.interpret([ 'node', '/usr/local/bin/perflint' ])
            assert.equal(result, 1)
        })

        it('should return error when no config can be found', function() {
            var result = cli.interpret([ 'node', '/usr/local/bin/perflint', '-u', 'example.com', '-c', '/tmp/' ])
            assert.equal(result, 1)
        })
    })
})
