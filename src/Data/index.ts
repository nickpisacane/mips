import * as AST from '../parse/AST'
import parseImmediate from '../utils/parseImmediate'

export type DataType =
  'byte'   |
  'word'   |
  'float'  |
  'double' |
  'ascii'  |
  'asciiz'

export const directives: string[] = [
  '.word',
  '.asciiz',
  '.ascii',
  '.byte',
  '.space',
  '.float',
  '.double',
]

export default interface Data {
  type: DataType
  toInt8Array(): Uint8Array
  size(): number
}

export function fromAST(node: AST.DataNode): Data {
  const directive = node.dataDirective
  if (!~directives.indexOf(directive)) {
    throw new Error(`Unknown data directive: ${directive}`)
  }

  switch (directive) {
    case '.ascii':
    case '.asciiz':
      const str = node.values[0].replace(/^"|"$/g, '')
      return directive === '.ascii' ? new ASCII(str) : new ASCIIZ(str)
    case '.word':
      return new Word(node.values.map(parseImmediate))
    case '.byte':
      return new Byte(node.values.map(value => {
        if (/^'/.test(value)) {
          return value.charCodeAt(1)
        }
        return parseImmediate(value)
      }))
    case '.space':
      return new Byte(new Array(parseImmediate(node.values[0])).fill(0))

  }

  // TODO: Implement
  return new Word([1])
}

export class Byte implements Data {
  public type: DataType = 'byte'
  private values: number[]

  constructor(values: number[]) {
    this.values = values
  }

  public size(): number {
    return this.values.length
  }

  public toInt8Array(): Uint8Array {
    const arr = new Uint8Array(this.size())

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

  public size(): number {
    return this.values.length * 4
  }

  public toInt8Array(): Uint8Array {
    const arr = new Uint8Array(this.size())

    for (let i = 0; i < this.values.length; i++) {
      arr[i + 0] = (this.values[i] & 0xff000000) >>> 24
      arr[i + 1] = (this.values[i] & 0x00ff0000) >>> 16
      arr[i + 2] = (this.values[i] & 0x0000ff00) >>> 8
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

  public size(): number {
    return this.value.length + (this.includeNullTerminator ? 1 : 0)
  }

  // TODO: Throw error when UTF8/Unicode chars are encountered?
  toInt8Array(): Uint8Array {
    const size = this.size()
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