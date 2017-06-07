# stdin-for-each

For each for command-line

## Requirements

* Node.js ≥ 6.0.0, and npm

## Installation

```bash
npm install --global stdin-for-each
```

## Usage

### Basic

**Syntax:**

```bash
foo | stdin-for-each command [args]
foo | foreach command [args]
```

* `foo`: Command that writes to stdout, e.g. `cat some-file.txt`, `echo hello`, etc.

**Example:**

_File:_ `input.txt`

```text
first line
second line

third line

```

_Command:_

```bash
cat input.txt | foreach bash -c 'echo ${CHUNK_INDEX}. size=$CHUNK_SIZE $CHUNK_CONTENT'
```

_Output:_

```text
0. size=10 first line
1. size=11 second line
2. size=0
3. size=10 third line
4. size=0
```
