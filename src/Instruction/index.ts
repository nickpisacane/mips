export type InstructionType =
  'R' |
  'I' |
  'J'

export default interface Instruction {
  type: string
  toInt(): number
}

// Masks
const OP_MASK   = 0xfc000000
const RS_MASK   = 0x03e00000
const RT_MASK   = 0x001f0000
const RD_MASK   = 0x0000f800
const SH_MASK   = 0x000007c0
const FUNC_MASK = 0x0000003f
const IMM_MASK  = 0x0000ffff
const ADDR_MASK = 0x03ffffff

// Shifts
const OP_SHIFT   = 26
const RS_SHIFT   = OP_SHIFT - 5
const RT_SHIFT   = RS_SHIFT - 5
const RD_SHIFT   = RT_SHIFT - 5
const SH_SHIFT   = RD_SHIFT - 5
const FUNC_SHIFT = SH_SHIFT - 6
const IMM_SHIFT  = RT_SHIFT - 16
const ADDR_SHIFT = OP_SHIFT - 26

export const utils = {
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

export class RInstruction implements Instruction {
  public type: InstructionType = 'R'
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

export class IInstruction implements Instruction {
  public type: InstructionType = 'I'
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

export class JInstruction implements Instruction {
  public type: InstructionType = 'J'
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