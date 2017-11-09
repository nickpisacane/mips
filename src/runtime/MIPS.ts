import { EventEmitter } from 'events'
import { Readable, Writable } from 'stream'

import parse from '../parse'
import assemble from '../assemble'
import AssembledObject from '../assemble/AssmebledObject'
import * as mappings from '../utils/mappings'
import Instruction, {
  RInstruction,
  IInstruction,
  JInstruction,
} from '../Instruction'
import * as int32 from '../utils/int32'
import * as float from '../utils/float'

import * as constants from './constants'
import PrimaryRegisters from './PrimaryRegisters'
import Memory from './Memory'
import Stack from './Stack'
import IO from './IO'
import FPRegisters from './FPRegisters'

const OP_CODES: { [key: string]: number } =
  Object.keys(mappings.instructions).reduce((opCodes, op) => {
    opCodes[op] = mappings.instructions[op].code
    return opCodes
  }, {} as { [key: string]: number })

export interface MIPSOptions {
  stdin: Readable
  stdout: Writable
  stderr: Writable
  source: string
}

export interface MIPSEmitter {
  // TODO: Define events API
}

export default class MIPS extends EventEmitter implements MIPSEmitter {
  private source: string

  private io: IO

  public assembledObj: AssembledObject
  public registers: PrimaryRegisters
  public fpRegisters: FPRegisters

  private dataMemory: Memory
  private heapMemory: Memory
  private stack: Stack

  private exited: boolean

  constructor(options: MIPSOptions) {
    super()

    this.source = options.source

    this.io = new IO({
      stdin: options.stdin,
      stdout: options.stdout,
      stderr: options.stderr,
    })
  }

  public updateSource(source: string) {
    this.source = source
  }

  public assemble() {
    this.registers = new PrimaryRegisters()
    this.fpRegisters = new FPRegisters()
    this.assembledObj = assemble(parse(this.source))
    this.dataMemory = new Memory({
      baseAddress: constants.BASE_DATA_ADDR,
      size: this.assembledObj.data.length,
      fixed: true,
      initial: this.assembledObj.data,
    })
    this.heapMemory = new Memory({
      size: 1024,
      baseAddress: constants.BASE_STACK_POINTER + 1,
    })
    this.stack = new Stack({
      size: 1024,
      end: constants.BASE_STACK_POINTER,
    })

    this.exited = false
  }

  public isAssembled(): boolean {
    return !!this.assembledObj
  }

  public async execute(): Promise<void> {
    while (!this.exited) {
      const ok = await this.executeNextInstruction()
      if (!ok) break
    }
  }

  public async executeNextInstruction(): Promise<boolean> {
    const index = this.resolveInstructionIndex()
    if (index >= this.assembledObj.objInstructions.length) {
      return false
    }
    const instr = this.assembledObj.objInstructions[index]
    await this.executeInstruction(instr)

    this.registers.set('pc', this.registers.getUnsigned('pc') + 4)
    return true
  }

  private async executeInstruction(i: Instruction) {
    // TODO: Implement
    const r = this.registers
    let a: number

    if (i instanceof RInstruction) {
      switch (i.func) {
        case OP_CODES.addu:
          r.set(i.rd, r.getUnsigned(i.rs) + r.getUnsigned(i.rt))
          break

        case OP_CODES.add:
          r.set(i.rd, r.get(i.rs) + r.get(i.rt))
          break

        case OP_CODES.subu:
          r.set(i.rd, int32.unsigned(int32.unsigned(r.get(i.rs)) - int32.unsigned(r.get(i.rt))))
          break

        case OP_CODES.sub:
          r.set(i.rd, r.get(i.rs) - r.get(i.rt))
          break

        case OP_CODES.mult:
          a = r.get(i.rs) * r.get(i.rt)
          r.set('hi', (a & 0xffff0000) >>> 16)
          r.set('lo', a & 0x0000ffff)
          break

        case OP_CODES.multu:
          a = int32.unsigned(int32.unsigned(r.get(i.rs)) * int32.unsigned(r.get(i.rt)))
          r.set('hi', (a & 0xffff0000) >>> 16)
          r.set('lo', a & 0x0000ffff)
          break

        case OP_CODES.div:
          r.set('lo', (r.get(i.rs) / r.get(i.rt)) | 0)
          r.set('hi', r.get(i.rs) % r.get(i.rt))
          break

        case OP_CODES.divu:
          r.set('lo', int32.unsigned(int32.unsigned(r.get(i.rs)) / int32.unsigned(r.get(i.rt))))
          r.set('hi', int32.unsigned(int32.unsigned(r.get(i.rs)) % int32.unsigned(r.get(i.rt))))
          break

        case OP_CODES.mfhi:
          r.set(i.rd, r.get('hi'))
          break

        case OP_CODES.mflo:
          r.set(i.rd, r.get('lo'))
          break

        case OP_CODES.and:
          r.set(i.rd, r.get(i.rs) & r.get(i.rt))
          break

        case OP_CODES.or:
          r.set(i.rd, r.get(i.rs) | r.get(i.rt))
          break

        case OP_CODES.nor:
          r.set(i.rd, ~(r.get(i.rs) | r.get(i.rt)))
          break

        case OP_CODES.xor:
          r.set(i.rd, r.get(i.rs) ^ r.get(i.rt))
          break

        case OP_CODES.sll:
          r.set(i.rd, r.get(i.rt) << i.sh)
          break

        case OP_CODES.srl:
          r.set(i.rd, r.get(i.rt) >>> i.sh)
          break

        case OP_CODES.sra:
          r.set(i.rd, r.get(i.rt) >> r.get(i.sh))
          break

        case OP_CODES.sllv:
          r.set(i.rd, r.get(i.rt) << r.get(i.rs))
          break

        case OP_CODES.srlv:
          r.set(i.rd, r.get(i.rt) >>> r.get(i.rs))
          break

        case OP_CODES.srav:
          r.set(i.rd, r.get(i.rt) >> r.get(i.rs))
          break

        case OP_CODES.sltu:
        case OP_CODES.slt:
          r.set(i.rd, r.get(i.rs) < r.get(i.rt) ? 1 : 0)
          break

        case OP_CODES.jr:
          r.set('pc', r.getUnsigned(i.rs) - 4)
          break

        case OP_CODES.jalr:
          r.set('$ra', r.getUnsigned('pc') + 4)
          r.set('pc', r.getUnsigned(i.rs))
          break

        case OP_CODES.syscall:
          await this.syscall(r.get('$v0'))
          break

        default:
          throw new Error(`Unknown R-type: ${i.func}`)
      }
    } else if (i instanceof IInstruction) {
      switch (i.op) {
        case OP_CODES.addi:
          r.set(i.rt, r.get(i.rs) + i.imm)
          break

        case OP_CODES.addiu:
          r.set(i.rt, int32.unsigned(int32.unsigned(r.get(i.rs)) + int32.unsigned(i.imm)))
          break

        case OP_CODES.andi:
          r.set(i.rt, r.get(i.rs) & i.imm)
          break

        case OP_CODES.ori:
          r.set(i.rt, r.get(i.rs) | i.imm)
          break

        case OP_CODES.xori:
          r.set(i.rt, r.get(i.rs) ^ i.imm)
          break

        case OP_CODES.slti:
          r.set(i.rt, int32.signed(r.get(i.rs)) < int32.signed(i.imm) ? 1 : 0)
          break

        case OP_CODES.sltiu:
          r.set(i.rt, int32.unsigned(r.get(i.rs)) < int32.unsigned(i.imm) ? 1 : 0)
          break

        case OP_CODES.beq:
          if (int32.signed(r.get(i.rs)) === int32.signed(r.get(i.rt))) {
            r.set('pc', r.get('pc') + (i.imm << 2))
          }
          break

        case OP_CODES.bne:
          if (int32.signed(r.get(i.rs)) !== int32.signed(r.get(i.rt))) {
            r.set('pc', r.get('pc') + (i.imm << 2))
          }
          break

        case OP_CODES.lui:
          r.set(i.rt, i.imm << 16)
          break

        case OP_CODES.lb:
          r.set(i.rt, int32.signed(this.readByte(r.get(i.rs) + i.imm) & 0x000000ff))
          break

        case OP_CODES.lbu:
          r.set(i.rt, int32.unsigned(this.readByte(r.get(i.rs) + i.imm) & 0x000000ff))
          break

        case OP_CODES.lh:
          r.set(i.rt, int32.signed(this.readHalf(r.get(i.rs) + i.imm) & 0x0000ffff))
          break

        case OP_CODES.lhu:
          r.set(i.rt, int32.unsigned(this.readHalf(r.get(i.rs) + i.imm) & 0x0000ffff))
          break

        case OP_CODES.lw:
          r.set(i.rt, int32.signed(this.readWord(r.get(i.rs) + i.imm)))
          break

        case OP_CODES.sb:
          this.writeByte(r.getUnsigned(i.rs) + i.imm, r.get(i.rt))
          break

        case OP_CODES.sh:
          this.writeHalf(r.getUnsigned(i.rs) + i.imm, r.get(i.rt))
          break

        case OP_CODES.sw:
          this.writeWord(r.getUnsigned(i.rs) + i.imm, r.get(i.rt))
          break

        case OP_CODES.ll:
          r.set(i.rt, this.readWord(r.get(i.rs) + i.imm))
          break

        case OP_CODES.sc:
          // TODO: Doube check implementation
          this.writeWord(r.get(i.rs) + i.imm, r.get(i.rt))
          r.set(i.rt, 1)
          break
        default:
          throw new Error(`Unknow I instruction: ${i.op}`)
      }
    } else if (i instanceof JInstruction) {
      // console.log('Executing (J): ', findCode(i.j, 'J'))
      switch (i.j) {
        case OP_CODES.j:
          r.set('pc', i.addr - 4)
          break

        case OP_CODES.jal:
          r.set('$ra', r.get('pc') + 4)
          r.set('pc', i.addr - 4)
          break
      }
    }
  }

  private resolveInstructionIndex(): number {
    const pc = this.registers.get('pc')
    return (pc - constants.BASE_TEXT_ADDR) / 4
  }

  private resolveMemory(address: number): Memory {
    const begOfData = constants.BASE_DATA_ADDR
    const endOfData = constants.BASE_DATA_ADDR + this.dataMemory.getSize()
    const endOfStack = constants.BASE_STACK_POINTER

    if (address >= begOfData && address < endOfData) {
      return this.dataMemory
    }
    if (address < endOfStack) {
      return this.stack
    }
    return this.heapMemory
  }

  private readByte(address: number): number {
    const mem = this.resolveMemory(address)

    return mem.get(address)
  }

  private writeByte(address: number, value: number) {
    const mem = this.resolveMemory(address)
    mem.set(address, value)
  }

  private readHalf(address: number): number {
    const mem = this.resolveMemory(address)
    let ret = 0

    ret += mem.get(address + 0) << 8
    ret += mem.get(address + 1)

    return ret
  }

  private writeHalf(address: number, value: number) {
    const mem = this.resolveMemory(address)
    mem.set(address + 0, (value & 0x0000ff00) >>> 8)
    mem.set(address + 1, (value & 0x000000ff))
  }

  private readWord(address: number): number {
    const mem = this.resolveMemory(address)
    let ret = 0

    ret += mem.get(address + 0) << 24
    ret += mem.get(address + 1) << 16
    ret += mem.get(address + 2) << 8
    ret += mem.get(address + 3)

    return ret | 0
  }

  private writeWord(address: number, value: number) {
    const mem = this.resolveMemory(address)
    mem.set(address + 0, (value & 0xff000000) >>> 24)
    mem.set(address + 1, (value & 0x00ff0000) >>> 16)
    mem.set(address + 2, (value & 0x0000ff00) >>> 8)
    mem.set(address + 3, (value & 0x000000ff))
  }

  private writeFloat(address: number, value: number, single: boolean = true) {
    const mem = this.resolveMemory(address)
    const binary = single ? float.singleToBinary(value) : float.doubleToBinary(value)
    const int8Arr = binary.toUint8Array()

    for (let i = 0; i < int8Arr.length; i++) {
      mem.set(address + i, int8Arr[i])
    }
  }

  private readFloat(address: number, single: boolean = true) {
    const mem = this.resolveMemory(address)
    const int8Arr = new Uint8Array(single ? 4 : 8)

    for (let i = 0; i < int8Arr.length; i++) {
      int8Arr[i] = mem.get(address + i)
    }

    return single ? float.singleFromBinary(int8Arr) : float.doubleFromBinary(int8Arr)
  }

  public writeSingle(address: number, value: number) {
    return this.writeFloat(address, value)
  }

  public readSingle(address: number): number {
    return this.readFloat(address)
  }

  public writeDouble(address: number, value: number) {
    return this.writeFloat(address, value, false)
  }

  public readDouble(address: number): number {
    return this.readFloat(address, false)
  }

  private readASCIIString(address: number): string {
    let ret = ''
    let c: number
    while ((c = this.readByte(address)) !== 0) {
      ret += String.fromCharCode(c)
      address++
    }
    return ret
  }

  private async syscall(code: number) {
    const r = this.registers

    switch (code) {
      case 1:
        // print integer
        this.io.write(r.get('$a0').toString())
        break
      case 2:
      case 3:
        // TODO: print float, double
        break
      case 4:
        // print string
        this.io.write(this.readASCIIString(r.get('$a0')))
        break
      case 5:
        // read integer
        const v = await this.io.readInt()
        // TODO: Handle NaN case
        r.set('$v0', v)
        break
      case 6:
      case 7:
      case 8:
      case 9:
        // TODO: read float, double, string. alloc heap
        break
      case 10:
        this.exited = true
        break
    }
  }
}