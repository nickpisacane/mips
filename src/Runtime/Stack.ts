import Memory from './Memory'

export interface StackOptions {
  size: number
  lastAddress: number
}

// Stack overrides Memory's `resolveIndex` and `resolveAddress` to provide a LIFO interface
export default class Stack extends Memory {
  private lastAddress: number

  constructor({ lastAddress, size }: StackOptions) {
    super({ size })
  }

  // Override => last address = first index...
  protected resolveIndex(address: number): number {
    return address - this.lastAddress
  }

  // Override => first index = last address...
  protected resolveAddress(index: number): number {
    return this.lastAddress - index
  }
}