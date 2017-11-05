import { EventEmitter } from 'events'

export interface MemoryOptions {
  size: number
  fixed?: boolean
  initial?: Uint8Array
  baseAddress?: number
}

export interface MemoryChangeEvent {
  address: number
  prevValue: number
  nextValue: number
}

export interface MemoryEmitter {
  on(event: 'change', listener: (changeEvent: MemoryChangeEvent) => void): void
}

export default class Memory extends EventEmitter implements MemoryEmitter {
  protected data: Uint8Array
  protected size: number
  protected fixed: boolean
  protected baseAddress: number

  constructor({ size, initial, fixed = false, baseAddress = 0 }: MemoryOptions) {
    super()

    this.size = size
    this.data = new Uint8Array(this.size)
    this.fixed = fixed
    this.baseAddress = baseAddress
    if (initial) {
      this.clone(initial)
    }
  }

  private clone(data: Uint8Array) {
    for (let i = 0; i < data.length; i++) {
      if (i > this.data.length - 1) {
        throw new Error(`Memory: Clone failed, out of range`)
      }
      this.data[i] = data[i]
    }
  }

  protected resolveIndex(address: number) {
    return address - this.baseAddress
  }

  protected resolveAddress(index: number) {
    return index + this.baseAddress
  }

  private expand(size: number) {
    const oldData = this.data

    this.data = new Uint8Array(size)
    this.size = size
    this.clone(oldData)
  }

  public get(address: number) {
    // TODO: Check bounds?
    return this.data[this.resolveIndex(address)]
  }

  public set(address: number, value: number) {
    const prevValue = this.get(address)
    const event: MemoryChangeEvent = {
      address,
      prevValue,
      nextValue: value,
    }

    const index = this.resolveIndex(address)
    if (index >= this.data.length) {
      this.expand(this.size * 2)
    }

    this.data[index] = value
    this.emit('change', event)
  }

  public getSize(): number {
    return this.size
  }
}