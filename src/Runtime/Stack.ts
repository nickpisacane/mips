import Memory from './Memory'

export interface StackOptions {
  size: number
  end: number
}

// Stack overrides Memory's `resolveIndex` and `resolveAddress` to provide a LIFO interface
export default class Stack extends Memory {
  private end: number

  constructor({ end, size }: StackOptions) {
    super({ size })
    this.end = end
  }

  // Override => last address = first index...
  protected resolveIndex(address: number): number {
    return this.end - 1 - address
  }

  // Override => first index = last address...
  protected resolveAddress(index: number): number {
    return this.end - 1 + index
  }
}