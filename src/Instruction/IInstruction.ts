import Instruction from './Instruction'

import {
  OP_SHIFT,
  RS_SHIFT,
  RT_SHIFT,
} from './constants'

/**
 * I-Type instruction
 */
export default class IInstruction implements Instruction {
  public type: string = 'I'
  public op: number
  public rs: number
  public rt: number
  public imm: number

  constructor(op: number, rs: number, rt: number, imm: number) {
    this.op = op
    this.rs = rs
    this.rt = rt
    this.imm = imm
  }

  public toInt(): number {
    const { op, rs, rt, imm } = this
    return (op << OP_SHIFT) + (rs << RS_SHIFT) + (rt << RT_SHIFT) + imm
  }
}