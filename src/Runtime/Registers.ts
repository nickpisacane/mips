import { EventEmitter } from 'events'

import invertIndexTable from '../utils/invertIndexTable'

export interface RegisterOptions {
  size: number
  mappings: { [key: string]: number }
}

export interface RegisterChangeEvent {
  name: string
  index: number
  prevValue: number
  nextValue: number
}

export interface RegistersEmitter {
  on(event: 'change', listener: (changeEvent: RegisterChangeEvent) => void): void
}

export default class Registers extends EventEmitter implements RegistersEmitter {
  public size: number
  protected nameToIndex: { [key: string]: number }
  protected indexToName: { [key: number]: string }
  protected registers: Uint32Array

  constructor(options: RegisterOptions) {
    super()

    this.size = options.size
    this.nameToIndex = options.mappings
    this.indexToName = invertIndexTable(options.mappings)
    this.registers = new Uint32Array(this.size)
  }

  public set(register: string | number, value: number) {
    const name = typeof register === 'string' ? register : this.indexToName[register]
    const index = typeof register === 'number' ? register : this.nameToIndex[register]
    if (typeof name === 'undefined' || typeof index === 'undefined') {
      throw new Error(`Registers: Register "${register}" not found.`)
    }

    const prevValue = this.registers[index]
    const nextValue = value
    this.registers[index] = nextValue

    this.emit('change', {
      name,
      index,
      prevValue,
      nextValue,
    })
  }

  public get(register: string | number) {
    const index = typeof register === 'number' ? register : this.nameToIndex[register]
    if (typeof index === 'undefined' || index > this.size - 1) {
      throw new Error(`Registers: Register "${register}" is out of range.`)
    }

    return this.registers[index]
  }
}