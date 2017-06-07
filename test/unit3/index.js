'use strict'

const shell = 'bash'

const env = {
  NOTRAILING: 'true'
}

const args = [
  "bash -c 'echo $CHUNK_INDEX. size=$CHUNK_SIZE $CHUNK_CONTENT'"
]

module.exports = (command, input) =>
  require('child_process').spawnSync(command, args, {input, shell, env})
