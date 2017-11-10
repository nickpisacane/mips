import Instruction from './Instruction'

import {
  OP_SHIFT,
  RS_SHIFT,
  RT_SHIFT,
  RD_SHIFT,
  SH_SHIFT,
  FUNC_SHIFT,
} from './constants'

/**
 * R-Type Instruction
 */
export default class RInstruction implements Instruction {
  public type: string = 'R'
  public op: number
  public rs: number
  public rt: number
  public rd: number
  public sh: number
  public func: number

  constructor(op: number, rs: number, rt: number, rd: number, sh: number, func: number) {
    this.op = op
    this.rs = rs
    this.rt = rt
    this.rd = rd
    this.sh = sh
    this.func = func
  }

  public toInt(): number {
    const { op, rs, rt, rd, sh, func } = this
    return (op << OP_SHIFT) + (rs << RS_SHIFT) + (rt << RT_SHIFT) + (rd << RD_SHIFT) + (sh << SH_SHIFT) + func
  }
}