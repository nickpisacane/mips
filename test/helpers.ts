import { Readable, Writable } from 'stream'

export class Collector extends Writable {
  private buf: string

  constructor() {
    super()

    this.buf = ''
  }

  _write(chunk: string | Buffer, encoding: string | null, callback: (err: Error | null) => void) {
    this.buf += chunk.toString()
    callback(null)
  }

  toString() {
    return this.buf
  }
}

export class Input extends Readable {
  private input: string
  private done: boolean

  constructor(input: string) {
    super()

    this.input = input
    this.done = false
  }

  _read() {
    if (!this.done) {
      this.push(this.input)
      this.done = true
    } else {
      this.push(null)
    }
  }
}