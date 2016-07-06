/**
 * @fileoverview Tests for options.
 * @author Jonathan Kingston and Matthew Harrison-Jones
 */

'use strict'

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var assert = require('chai').assert,
    formatter = require('../../../lib/formatters/tap')

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

describe('formatter:tap', () => {
  describe('when passed no messages', () => {
    const code = [{
      url: 'http://example.com',
      messages: []
    }]

    it('should return nothing', () => {
      const result = formatter(code)

      assert.equal(result, 'TAP version 13\n1.. 1\nok 1 - http://example.com\n')
    })
  })

  describe('when passed a single message', () => {
    const code = [{
      url: 'http://example.com',
      messages: [{
        message: 'Unexpected foo.',
        severity: 2,
        actual: 5,
        min: 10,
        ruleId: 'foo'
      }]
    }]

    it('should return a string with YAML severity, actual and expected', () => {
      const result = formatter(code)

      assert.equal(result, 'TAP version 13\n1.. 1\nnot ok 1 - http://example.com\n  ---\n  message: Unexpected foo.\n  severity: error\n  data:\n    actual: 5\n    expected: 10\n    ruleId: foo\n  ...\n')
    })

    it('should return a string with actual: x, expected: y, severity: warning for warnings', () => {
      code[0].messages[0].severity = 1
      const result = formatter(code)

      assert.include(result, 'actual: 5')
      assert.include(result, 'expected: 10')
      assert.include(result, 'ruleId: foo')
      assert.include(result, 'severity: warning')
      assert.include(result, '1.. 1')
    })
  })

  describe('when passed multiple messages', () => {
    const code = [{
      url: 'http://example.com',
      messages: [{
        message: 'Unexpected foo.',
        severity: 2,
        actual: 5,
        min: 10,
        ruleId: 'foo'
      }, {
        message: 'Unexpected bar.',
        severity: 1,
        actual: 6,
        min: 11,
        ruleId: 'bar'
      }, {
        message: 'Unexpected baz.',
        severity: 1,
        actual: 7,
        min: 12,
        ruleId: 'baz'
      }]
    }]

    it('should return a string with multiple entries', () => {
      const result = formatter(code)

      assert.include(result, 'not ok')
      assert.include(result, 'messages')
      assert.include(result, 'Unexpected foo.')
      assert.include(result, 'actual: 5')
      assert.include(result, 'expected: 10')
      assert.include(result, 'Unexpected bar.')
      assert.include(result, 'actual: 6')
      assert.include(result, 'expected: 11')
      assert.include(result, 'Unexpected baz.')
      assert.include(result, 'actual: 7')
      assert.include(result, 'expected: 12')
    })
  })

  describe('when passed multiple files with 1 message each', () => {
    const code = [{
      url: 'http://example.com',
      messages: [{
        message: 'Unexpected foo.',
        severity: 2,
        actual: 5,
        min: 10,
        ruleId: 'foo'
      }]
    }, {
      url: 'http://example2.com',
      messages: [{
        message: 'Unexpected bar.',
        severity: 1,
        actual: 6,
        min: 11,
        ruleId: 'bar'
      }]
    }]

    it('should return a string with multiple entries', () => {
      const result = formatter(code)

      assert.include(result, 'not ok 1')
      assert.include(result, 'not ok 2')
    })
  })
})
