/**
 * @fileoverview Tests for stylish formatter.
 * @author Matthew Harrison-Jones & ESLint (https://github.com/eslint/eslint/blob/master/tests/lib/formatters/stylish.js)
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const { assert } = require('chai')
const chalk = require('chalk')
const stripAnsi = require('strip-ansi')
const proxyquire = require('proxyquire')
const sinon = require('sinon')

// Chalk protects its methods so we need to inherit from it
// for Sinon to work.
const chalkStub = Object.create(chalk, {
  yellow: {
    value(str) {
      return chalk.yellow(str)
    },
    writable: true
  },
  red: {
    value(str) {
      return chalk.red(str)
    },
    writable: true
  }
})

chalkStub.yellow.bold = chalk.yellow.bold
chalkStub.red.bold = chalk.red.bold

const formatter = proxyquire('../../../lib/formatters/stylish', {
  chalk: chalkStub
})

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

describe('formatter:stylish', () => {
  let sandbox
  const colorsEnabled = chalk.enabled

  beforeEach(() => {
    chalk.enabled = false
    sandbox = sinon.createSandbox()
    sandbox.spy(chalkStub.yellow, 'bold')
    sandbox.spy(chalkStub.red, 'bold')
  })

  afterEach(() => {
    sandbox.verifyAndRestore()
    chalk.enabled = colorsEnabled
  })

  describe('when passed no messages', () => {
    const code = [
      {
        url: 'http://example.com',
        summary: 'http://webpagetest.com',
        messages: []
      }
    ]

    it('should not return any messages', () => {
      const result = formatter(code)
      assert.equal(result, '')
      assert.equal(chalkStub.yellow.bold.callCount, 0)
      assert.equal(chalkStub.red.bold.callCount, 0)
    })
  })

  describe('when passed a single message', () => {
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

    it('should return a string in the correct format for errors', () => {
      const result = stripAnsi(formatter(code))
      assert.equal(
        result,
        "\nhttp://example.com — http://webpagetest.com\n  error  'foo' is 2 should be less than 1  foo\n\n\u2716 1 problem (1 error, 0 warnings)\n"
      )
      assert.equal(chalkStub.yellow.bold.callCount, 0)
      assert.equal(chalkStub.red.bold.callCount, 1)
    })

    it('should return a string in the correct format for warnings', () => {
      code[0].messages[0].severity = 1
      const result = stripAnsi(formatter(code))
      assert.equal(
        result,
        "\nhttp://example.com — http://webpagetest.com\n  warning  'foo' is 2 should be less than 1  foo\n\n\u2716 1 problem (0 errors, 1 warning)\n"
      )
      assert.equal(chalkStub.yellow.bold.callCount, 1)
      assert.equal(chalkStub.red.bold.callCount, 0)
    })
  })

  describe('when passed multiple messages', () => {
    const code = [
      {
        url: 'http://example.com',
        summary: 'http://webpagetest.com',
        messages: [
          {
            ruleId: 'foo',
            severity: 2,
            message: "'foo' is 2 should be less than 1"
          },
          {
            ruleId: 'bar',
            severity: 1,
            message: "'bar' is 1 should be greater than 2"
          }
        ]
      }
    ]

    it('should return a string with multiple entries', () => {
      const result = stripAnsi(formatter(code))
      assert.equal(
        result,
        "\nhttp://example.com — http://webpagetest.com\n    error  'foo' is 2 should be less than 1     foo\n  warning  'bar' is 1 should be greater than 2  bar\n\n\u2716 2 problems (1 error, 1 warning)\n"
      )
      assert.equal(chalkStub.yellow.bold.callCount, 0)
      assert.equal(chalkStub.red.bold.callCount, 1)
    })
  })
})
