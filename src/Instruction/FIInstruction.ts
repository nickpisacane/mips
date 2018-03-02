import Instruction from './Instruction'

import {
  OP_SHIFT,
  FMT_SHIFT,
  FT_SHIFT,
} from './constants'

/**
 * FI-Type instruction
 */
export default class FIInstruction implements Instruction {
  public type: string = 'FI'
  public op: number
  public fmt: number
  public ft: number
  public imm: number

  constructor(op: number, fmt: number, ft: number, imm: number) {
    this.op = op
    this.fmt = fmt
    this.ft = ft
    this.imm = imm
  }

  public toInt(): number {
    const { op, fmt, ft, fs, imm } = this
    return (op << OP_SHIFT) + (fmt << FMT_SHIFT) + (ft << FT_SHIFT) + imm
  }
}