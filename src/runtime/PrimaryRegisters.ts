import Registers from './Registers'
import { BASE_TEXT_ADDR, BASE_STACK_POINTER } from './constants'
import { registers } from '../utils/mappings'

export default class PrimaryRegisters extends Registers {
  constructor() {
    super({
      size: 35,
      mappings: registers,
    })

    // Default value for $sp register
    this.registers[29] = BASE_STACK_POINTER
    // Default value for pc register
    this.registers[32] = BASE_TEXT_ADDR
  }
}