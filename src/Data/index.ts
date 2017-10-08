export type DataType =
  'byte'   |
  'word'   |
  'float'  |
  'double' |
  'ascii'  |
  'asciiz'

export default interface Data {
  type: DataType
  toInt8Array(): Uint8Array
}

export class Byte implements Data {
  public type: DataType = 'byte'
  private values: number[]

  constructor(values: number[]) {
    this.values = values
  }

  public toInt8Array(): Uint8Array {
    const arr = new Uint8Array(this.values.length)

    for (let i = 0; i < this.values.length; i++) {
      arr[i] = this.values[i] | 0
    }

    return arr
  }
}

export class Word implements Data {
  public type: DataType = 'word'
  private values: number[]

  constructor(values: number[]) {
    this.values = values
  }

  public toInt8Array(): Uint8Array {
    const arr = new Uint8Array(this.values.length * 4)

    for (let i = 0; i < this.values.length; i++) {
      arr[i + 0] = (this.values[i] & 0xff000000) >> 24
      arr[i + 1] = (this.values[i] & 0x00ff0000) >> 16
      arr[i + 2] = (this.values[i] & 0x0000ff00) >> 8
      arr[i + 3] = (this.values[i] & 0x000000ff)
    }

    return arr
  }
}

export class BaseASCII {
  private value: string
  private includeNullTerminator: boolean = false

  constructor(value: string, includeNullTerminator: boolean = false) {
    this.value = value
    this.includeNullTerminator = includeNullTerminator
  }

  // TODO: Throw error when UTF8/Unicode chars are encountered?
  toInt8Array(): Uint8Array {
    const size = this.value.length + (this.includeNullTerminator ? 1 : 0)
    const arr = new Uint8Array(size)

    for (let i = 0; i < this.value.length; i++) {
      arr[i] = this.value.charCodeAt(i)
    }

    if (this.includeNullTerminator) {
      arr[size - 1] = 0
    }

    return arr
  }
}

export class ASCII extends BaseASCII implements Data {
  public type: DataType = 'ascii'

  constructor(value: string) {
    super(value, false)
  }
}

export class ASCIIZ extends BaseASCII implements Data {
  public type: DataType = 'asciiz'

  constructor(value: string) {
    super(value, true)
  }
}