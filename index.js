#! /usr/bin/env node
'use strict'

const split = require('split')
const indent = require('indent-string')

function main (
  process = require('process'),
  {
    vm = require('vm'),
    childProcess = require('child_process')
  } = {}
) {
  const {
    stdin,
    stdout,
    stderr,
    argv = [],
    env = {}
  } = process

  const {
    MATCHER,
    SPLIT_MATCHER = MATCHER,
    SHELL,
    OUTPUT_PREFIX = '',
    STDOUT_PREFIX = OUTPUT_PREFIX,
    STDERR_PREFIX = OUTPUT_PREFIX,
    ENDCHUNK = '',
    NOTRAILING
  } = env

  const [command, ...args] = argv.slice(2)
  const writeout = chunk => stdout.write(STDOUT_PREFIX + chunk + ENDCHUNK)
  const writeerr = chunk => stderr.write(STDERR_PREFIX + chunk + ENDCHUNK)

  let chunkIndex = 0
  let promise = Promise.resolve({status: 0})
  stdin.pipe(
    split(
      ...SPLIT_MATCHER
        ? [vm.runInNewContext(
          SPLIT_MATCHER,
          {
            process,
            stdin,
            argv,
            env,
            vm,
            require,
            global,
            get self () { return this }
          }
        )]
        : [],
      {
        trailing: NOTRAILING === 'true'
      }
    )
  ).on(
    'data',
    chunk => promise.then(prev => {
      const shell = SHELL
        ? (SHELL === 'true' ? true : SHELL)
        : false

      const content = String(chunk)

      const variables = Object.assign({}, env, {
        CHUNK_INDEX: chunkIndex,
        CHUNK_SIZE: chunk.length,
        CHUNK_CONTENT: content,
        CHUNK_STRLEN: content.length,
        PREVIOUS_RESPONSE: JSON.stringify(prev),
        PREVIOUS_STATUS: prev.status,
        PREVIOUS_SIGNAL: prev.signal
      })

      chunkIndex += 1

      const subprocess = childProcess.spawn(command, args, {shell, env: variables})
      subprocess.stdout.on('data', writeout)
      subprocess.stderr.on('data', writeerr)

      promise = new Promise(resolve => {
        const listener = (status, signal) =>
          resolve({env: variables, status, signal})

        subprocess.on('exit', listener)
      })
    })
  ).on(
    'error',
    chunk =>
      stderr.write('[ERROR] (stdin-for-each) Cannot parse input stream:\n' + indent(String(chunk), 4) + '\n')
  )
}

if (require.main === module) {
  main()
} else {
  module.exports = main
}
