import { EventEmitter } from 'events'
import { PassThrough, Writable } from 'stream'

export interface IOAdapterEmitter {
  on(event: 'data', listener: (data: string) => void): void
}

export default class IOAdapter extends EventEmitter implements IOAdapterEmitter {
  public stdin: PassThrough
  public stdout: Writable
  public stderr: Writable

  private handleOnData = (data: string | Buffer) => {
    data = data.toString()
    this.emit('data', data)
  }

  constructor() {
    super()

    this.stdin = new PassThrough()
    const writer = new Writable({
      write: (chunk: string | Buffer, encoding, callback) => {
        this.handleOnData(chunk)
        callback()
      },
    })
    this.stdout = this.stderr = writer

    this.stdin.on('data', this.handleOnData)
  }

  public destroy() {
    this.removeAllListeners()
    this.stdin.removeAllListeners()
    this.stdout.removeAllListeners()
    this.stderr.removeAllListeners()
  }
}