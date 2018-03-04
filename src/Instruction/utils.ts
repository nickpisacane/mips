import Instruction from './Instruction'
import RInstruction from './RInstruction'
import JInstruction from './JInstruction'
import IInstruction from './IInstruction'
import FIInstruction from './FIInstruction'
import FRInstruction from './FRInstruction'

import {
  OP_MASK,
  OP_SHIFT,
  RS_MASK,
  RS_SHIFT,
  RT_MASK,
  RT_SHIFT,
  RD_MASK,
  RD_SHIFT,
  SH_MASK,
  SH_SHIFT,
  FUNC_MASK,
  FUNC_SHIFT,
  IMM_MASK,
  IMM_SHIFT,
  ADDR_MASK,
  ADDR_SHIFT,
  FMT_MASK,
  FMT_SHIFT,
  FT_MASK,
  FT_SHIFT,
  FD_MASK,
  FD_SHIFT,
  FS_MASK,
  FS_SHIFT,
} from './constants'

export default {
  fromInt(instr: number): Instruction {
    const op = (instr & OP_MASK) >>> OP_SHIFT
    if (op === 0) {
      // R type
      const rs = (instr & RS_MASK) >>> RS_SHIFT
      const rt = (instr & RT_MASK) >>> RT_SHIFT
      const rd = (instr & RD_MASK) >>> RD_SHIFT
      const sh = (instr & SH_MASK) >>> SH_SHIFT
      const func = (instr & FUNC_MASK) >>> FUNC_SHIFT
      return new RInstruction(op, rs, rt, rd, sh, func)
    }
    if (op <= 3) {
      // J type
      const addr = (instr & ADDR_MASK) >>> ADDR_SHIFT
      return new JInstruction(op, addr)
    }
    if (op === 0x11) {
      // FR or FI type
      const fmt = (instr & FMT_MASK) >>> FMT_SHIFT
      const ft  = (instr & FT_MASK)  >>> FT_SHIFT

      if (fmt === 0x8) {
        const imm = (instr & IMM_MASK) >>> IMM_SHIFT;
        return new FIInstruction(op, fmt, ft, imm)
      }

      const fs = (instr & FS_MASK) >>> FS_SHIFT
      const fd = (instr & FD_MASK) >>> FD_SHIFT
      const func = (instr & FUNC_MASK) >>> FUNC_SHIFT

      return new FRInstruction(op, fmt, ft, fs, fd, func)

    }

    const rs = (instr & RS_MASK) >>> RS_SHIFT
    const rt = (instr & RT_MASK) >>> RT_SHIFT
    const imm = (instr & IMM_MASK) >>> IMM_SHIFT

    return new IInstruction(op, rs, rt, imm)
  },

  isR(instr: Instruction): instr is RInstruction {
    return instr.type === 'R'
  },

  isI(instr: Instruction): instr is IInstruction {
    return instr.type === 'I'
  },

  isJ(instr: Instruction): instr is JInstruction {
    return instr.type === 'J'
  },

  isFR(instr: Instruction): instr is FRInstruction {
    return instr.type === 'FR'
  },

  isFI(instr: Instruction): instr is FIInstruction {
    return instr.type === 'FI'
  },
}