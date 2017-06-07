'use strict'
const {resolve} = require('path')
const {readdirSync, readFileSync} = require('fs')
const {strictEqual} = require('assert')
const jtry = require('just-try')
const command = resolve(__dirname, '../index.js')
const input = readFileSync(resolve(__dirname, 'input.txt'), 'utf8').trim()

const [success, failure, logs] = readdirSync(__dirname)
  .filter(item => /^unit[0-9]*$/.test(item))
  .map(unit =>
    ['index.js', 'output.txt'].map(file => resolve(__dirname, unit, file))
  )
  .map(([index, output]) =>
    [require(index), readFileSync(output, 'utf8'), index]
  )
  .reduce(([success, failure, logs], [test, output, index]) => jtry(
    () => {
      const ret = test(command, input)
      const actualOutput = String(ret.stdout).trim()
      strictEqual(actualOutput, output, `Failed at '${index}'`)
      return [success + 1, failure, logs]
    },
    error =>
      [success, failure + 1, [...logs, error]]
  ), [0, 0, []])

logs.forEach(error =>
  console.error('[FAILURE]', error)
)

console.info('[SUMMARY]', {success, failure})
require('process').exit(failure)
