import { Readable, Writable } from 'stream'

export interface IOOptions {
  stdin: Readable
  stdout: Writable
  stderr: Writable
}

export default class IO {
  private stdin: Readable
  private stdout: Writable
  private stderr: Writable

  private inBuffer: string

  constructor({ stdin, stdout, stderr }: IOOptions) {
    this.stdin = stdin
    this.stdout = stdout
    this.stderr = stderr
    this.inBuffer = ''
  }

  public readChar(): Promise<string> {
    if (this.inBuffer.length) {
      const ret = this.inBuffer[0]
      this.inBuffer = this.inBuffer.substr(1)
      return Promise.resolve(ret)
    }

    return new Promise((resolve, reject) => {
      const removeListeners = () => {
        this.stdin.removeListener('close', closeHandler)
        this.stdin.removeListener('error', errHandler)
        this.stdin.removeListener('data', dataHandler)
      }
      const closeHandler = () => {
        removeListeners()
        reject(new Error(`IO: stdin exited during read.`))
      }
      const errHandler = (err: Error) => {
        removeListeners()
        reject(err)
      }
      const dataHandler = (chunk: string | Buffer) => {
        const data = chunk.toString()
        if (data.length) {
          const ret = data[0]
          this.inBuffer += data.substr(1)

          removeListeners()
          resolve(ret)
        }
      }

      this.stdin.on('close', closeHandler)
      this.stdin.on('error', errHandler)
      this.stdin.on('data', dataHandler)
    })
  }

  private async readUntilMatch(re: RegExp) {
    let ret = ''

    while (true) {
      const current = await this.readChar()
      if (re.test(current)) {
        return ret
      } else {
        ret += current
      }
    }
  }

  // Reads until space
  public read(): Promise<string> {
    return this.readUntilMatch(/^\s/)
  }

  public write(data: string) {
    this.stdout.write(data)
  }

  public writeErr(data: string) {
    this.stderr.write(data)
  }
}