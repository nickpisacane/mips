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

  public setSingle(register: string | number, value: number) {
    // TODO
  }

  public setDouble(register: string | number, value: number) {
    // TODO
  }

  public getSingle(register: string | number): number {
    // TODO
    return 42
  }

  public getDouble(register: string | number): number {
    // TODO
    return 42
  }
}