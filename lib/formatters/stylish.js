/**
 * @fileoverview Stylish reporter
 * @author  Matthew Harrison-Jones & ESLint (https://github.com/eslint/eslint/blob/113c81f49712e3d86db1b112c37ce3b900f6c25e/lib/formatters/stylish.js)
 */

const chalk = require('chalk')
const table = require('text-table')

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

/**
 * Given a word and a count, append an s if count is not one.
 * @param {string} word A word in its singular form.
 * @param {int} count A number controlling whether word should be pluralized.
 * @returns {string} The original word with an s on the end if count is not one.
 */
function pluralize(word, count) {
  return count === 1 ? word : `${word}s`
}

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

module.exports = (results) => {
  let output = '\n'
  let total = 0
  let errors = 0
  let warnings = 0
  let summaryColor = 'yellow'

  results.forEach((result) => {
    const { messages } = result

    if (messages.length === 0) {
      return
    }

    total += messages.length
    output += `${chalk.underline(`${result.url} — ${result.summary}`)}\n`

    output += `${table(
      messages.map((message) => {
        let messageType

        if (message.severity === 2) {
          messageType = chalk.red('error')
          summaryColor = 'red'
          errors += 1
        } else {
          messageType = chalk.yellow('warning')
          warnings += 1
        }

        return [
          '',
          messageType,
          message.message.replace(/\.$/, ''),
          chalk.dim(message.ruleId || '')
        ]
      }),
      {
        align: ['', 'r', 'l'],
        stringLength(str) {
          return chalk.reset(str).length
        }
      }
    )}\n\n`
  })

  if (total > 0) {
    output += chalk[summaryColor].bold(
      [
        '\u2716 ',
        total,
        pluralize(' problem', total),
        ' (',
        errors,
        pluralize(' error', errors),
        ', ',
        warnings,
        pluralize(' warning', warnings),
        ')\n'
      ].join('')
    )
  }

  return total > 0 ? output : ''
}
