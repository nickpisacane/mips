import { Writable } from 'stream'

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