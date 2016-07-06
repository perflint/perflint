/**
 * @fileoverview Tests for jUnit Reporter
 * @author Jamund Ferguson and Matthew Harrison-Jones
 */
'use strict'

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var assert     = require('chai').assert,
    formatter  = require('../../../lib/formatters/junit')

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

describe('formatter:junit', () => {
  describe('when there are no problems', () => {
    const code = []

    it('should not complain about anything', () => {
      const result = formatter(code)

      assert.equal(result.replace(/\n/g, ''), '<?xml version="1.0" encoding="utf-8"?><testsuites></testsuites>')
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

      it('should return a single <testcase> with a message and the actual and expected number in the body (error)', () => {
        const result = formatter(code)

        assert.equal(result.replace(/\n/g, ''), '<?xml version="1.0" encoding="utf-8"?><testsuites><testsuite package="org.perflint" time="0" tests="1" errors="1" name="http://example.com"><testcase time="0" name="org.perflint.foo"><error message="Unexpected foo."><![CDATA[actual 5, expected 10, Error - Unexpected foo. (foo)]]></error></testcase></testsuite></testsuites>')
      })

      it('should return a single <testcase> with a message and the actual and expected number in the body (warning)', () => {
        code[0].messages[0].severity = 1
        const result = formatter(code)

        assert.equal(result.replace(/\n/g, ''), '<?xml version="1.0" encoding="utf-8"?><testsuites><testsuite package="org.perflint" time="0" tests="1" errors="1" name="http://example.com"><testcase time="0" name="org.perflint.foo"><failure message="Unexpected foo."><![CDATA[actual 5, expected 10, Warning - Unexpected foo. (foo)]]></failure></testcase></testsuite></testsuites>')
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
        }]
      }]

      it('should return a multiple <testcase>\'s', () => {
        const result = formatter(code)

        assert.equal(result.replace(/\n/g, ''), '<?xml version="1.0" encoding="utf-8"?><testsuites><testsuite package="org.perflint" time="0" tests="2" errors="2" name="http://example.com"><testcase time="0" name="org.perflint.foo"><error message="Unexpected foo."><![CDATA[actual 5, expected 10, Error - Unexpected foo. (foo)]]></error></testcase><testcase time="0" name="org.perflint.bar"><failure message="Unexpected bar."><![CDATA[actual 6, expected 11, Warning - Unexpected bar. (bar)]]></failure></testcase></testsuite></testsuites>')
      })
    })

    describe('when passed special characters', () => {
      const code = [{
        url: 'http://example.com',
        messages: [{
          message: 'Unexpected <foo></foo>.',
          severity: 1,
          actual: 5,
          min: 10,
          ruleId: 'foo'
        }]
      }]

      it('should make them go away', () => {
        const result = formatter(code)

        assert.equal(result.replace(/\n/g, ''), '<?xml version="1.0" encoding="utf-8"?><testsuites><testsuite package="org.perflint" time="0" tests="1" errors="1" name="http://example.com"><testcase time="0" name="org.perflint.foo"><failure message="Unexpected &lt;foo&gt;&lt;/foo&gt;."><![CDATA[actual 5, expected 10, Warning - Unexpected &lt;foo&gt;&lt;/foo&gt;. (foo)]]></failure></testcase></testsuite></testsuites>')
      })
    })

    describe('when passed multiple files with 1 message each', () => {
      const code = [{
        url: 'http://example.com',
        messages: [{
          message: 'Unexpected foo.',
          severity: 1,
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

      it('should return 2 <testsuite>\'s', () => {
        const result = formatter(code)

        assert.equal(result.replace(/\n/g, ''), '<?xml version="1.0" encoding="utf-8"?><testsuites><testsuite package="org.perflint" time="0" tests="1" errors="1" name="http://example.com"><testcase time="0" name="org.perflint.foo"><failure message="Unexpected foo."><![CDATA[actual 5, expected 10, Warning - Unexpected foo. (foo)]]></failure></testcase></testsuite><testsuite package="org.perflint" time="0" tests="1" errors="1" name="http://example2.com"><testcase time="0" name="org.perflint.bar"><failure message="Unexpected bar."><![CDATA[actual 6, expected 11, Warning - Unexpected bar. (bar)]]></failure></testcase></testsuite></testsuites>')
      })
    })

    describe('when passed multiple files with total 1 failure', () => {
      const code = [{
        url: 'http://example.com',
        messages: [{
          message: 'Unexpected foo.',
          severity: 1,
          actual: 5,
          min: 10,
          ruleId: 'foo'
        }]
      }, {
        url: 'http://example2.com',
        messages: []
      }]

      it('should return 1 <testsuite>', () => {
        const result = formatter(code)

        assert.equal(result.replace(/\n/g, ''), '<?xml version="1.0" encoding="utf-8"?><testsuites><testsuite package="org.perflint" time="0" tests="1" errors="1" name="http://example.com"><testcase time="0" name="org.perflint.foo"><failure message="Unexpected foo."><![CDATA[actual 5, expected 10, Warning - Unexpected foo. (foo)]]></failure></testcase></testsuite></testsuites>')
      })
    })
})
