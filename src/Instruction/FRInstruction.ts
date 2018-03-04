import Instruction from './Instruction'

import {
  OP_SHIFT,
  FMT_SHIFT,
  FT_SHIFT,
  FS_SHIFT,
  FD_SHIFT,
  FUNC_SHIFT,
} from './constants'

/**
 * FR-Type Instruction
 */
export default class FRInstruction implements Instruction {
  public type: string = 'FR'
  public op: number
  public fmt: number
  public ft: number
  public fs: number
  public fd: number
  public func: number

  constructor(op: number, fmt: number, ft: number, fs: number, fd: number, func: number) {
    this.op = op
    this.fmt = fmt
    this.ft = ft
    this.fs = fs
    this.fd = fd
    this.func = func
  }

  public toInt(): number {
    const { op, fmt, ft, fs, fd, func } = this
    return (op << OP_SHIFT) + (fmt << FMT_SHIFT) + (ft << FT_SHIFT) + (fs << FS_SHIFT) + (fd << FD_SHIFT) + func
  }
}