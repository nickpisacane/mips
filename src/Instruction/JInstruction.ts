import Instruction from './Instruction'

import { OP_SHIFT } from './constants'

/**
 * J-Type instruction
 */
export default class JInstruction implements Instruction {
  public type: string = 'J'
  public j: number
  public addr: number

  constructor(j: number, addr: number) {
    this.j = j
    this.addr = addr
  }

  public toInt(): number {
    const { j, addr } = this
    return (j << OP_SHIFT) + addr
  }
}