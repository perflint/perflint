/**
 * @fileoverview Tests for JSON formatter
 * @author Matthew Harrison-Jones
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const { assert } = require('chai')
const formatter = require('../../../lib/formatters/json')

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

describe('formatter:json', () => {
  const code = [
    {
      url: 'http://example.com',
      summary: 'http://webpagetest.com',
      messages: [
        {
          ruleId: 'foo',
          severity: 2,
          message: "'foo' is 2 should be less than 1"
        }
      ]
    }
  ]

  it('should return a JSON string', () => {
    const result = JSON.parse(formatter(code))
    assert.deepEqual(result, code)
  })
})
