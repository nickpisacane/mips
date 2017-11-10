import Instruction from './Instruction'
import RInstruction from './RInstruction'
import JInstruction from './JInstruction'
import IInstruction from './IInstruction'

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
}