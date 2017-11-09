import * as float from '../../src/utils/float'
import Registers from './Registers'
import { fpRegisters } from '../utils/mappings'

export default class FPRegisters extends Registers {
  constructor() {
    super({
      size: 32,
      mappings: fpRegisters,
    })
  }

  private getRegisterIndex(register: string | number): number {
    return typeof register === 'number'
      ? register
      : fpRegisters[register]
  }

  private checkDoubleIndex(index: number) {
    if (index % 2 !== 0) {
      throw new Error(`FPRegisters: Cannot set double in odd-indexed register`)
    }
  }

  public setSingle(register: string | number, value: number) {
    const binary = float.singleToBinary(value)
    const int32Arr = binary.toUint32Array()
    this.set(register, int32Arr[0])
  }

  public setDouble(register: string | number, value: number) {
    const binary = float.doubleToBinary(value)
    const int32Arr = binary.toUint32Array()
    const index = this.getRegisterIndex(register)

    this.checkDoubleIndex(index)

    this.set(index, int32Arr[0])
    this.set(index + 1, int32Arr[1])
  }

  public getSingle(register: string | number): number {
    const int32Arr = new Uint32Array(1)
    int32Arr[0] = this.get(register)

    return float.singleFromBinary(int32Arr)
  }

  public getDouble(register: string | number): number {
    const index = this.getRegisterIndex(register)
    this.checkDoubleIndex(index)

    const int32Arr = new Uint32Array(2)
    int32Arr[0] = this.get(index)
    int32Arr[1] = this.get(index + 1)

    return float.doubleFromBinary(int32Arr)
  }
}