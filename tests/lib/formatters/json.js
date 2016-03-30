/**
 * @fileoverview Tests for JSON formatter
 * @author Matthew Harrison-Jones
 */

'use strict'

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var assert     = require('chai').assert,
    formatter  = require('../../../lib/formatters/json')

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

describe('formatter:json', function() {
  var code = [{
    url: 'http://example.com',
    summary: 'http://webpagetest.com',
    messages: [{
      ruleId: 'foo',
      severity: 2,
      message: '\'foo\' is 2 should be less than 1'
    }]
  }]

  it('should return a JSON string', function() {
    var result = JSON.parse(formatter(code))
    assert.deepEqual(result, code)
  })
})
