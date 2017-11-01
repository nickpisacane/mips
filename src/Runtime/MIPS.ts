import { EventEmitter } from 'events'
import { Readable, Writable } from 'stream'

import parse from '../parse'
import assemble from '../assemble'
import AssembledObject from '../assemble/AssmebledObject'
import * as mappings from '../utils/mappings'
import Instruction from '../Instruction'

import * as constants from './constants'
import PrimaryRegisters from './PrimaryRegisters'
import Memory from './Memory'
import Stack from './Stack'
import IO from './IO'

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

  private assembledObj: AssembledObject
  private primaryRegisters: PrimaryRegisters

  private dataMemory: Memory
  private heapMemory: Memory
  private stack: Stack

  constructor(options: MIPSOptions) {
    super()

    this.source = options.source

    this.io = new IO({
      stdin: options.stdin,
      stdout: options.stdout,
      stderr: options.stderr,
    })

    this.primaryRegisters = new PrimaryRegisters()
    this.assembledObj = assemble(parse(this.source))
    this.dataMemory = new Memory({
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
      lastAddress: constants.BASE_STACK_POINTER,
    })
  }

  public executeNextInstruction(): boolean {
    const index = this.resolveInstructionIndex()
    if (index >= this.assembledObj.objInstructions.length) {
      return false
    }
    const instr = this.assembledObj.objInstructions[index]
    this.executeInstruction(instr)

    this.primaryRegisters.set('pc', this.primaryRegisters.get('pc') + 4)
    return true
  }

  private executeInstruction(instr: Instruction) {
    // TODO: Implement
  }

  private resolveInstructionIndex(): number {
    const pc = this.primaryRegisters.get('pc')
    return (pc - constants.BASE_TEXT_ADDR) / 4
  }

  private resolveMemory(address: number): Memory {
    const begOfData = constants.BASE_DATA_ADDR
    const endOfData = constants.BASE_DATA_ADDR + this.dataMemory.getSize()
    const endOfStack = constants.BASE_STACK_POINTER

    if (address >= begOfData && address < endOfData) {
      return this.dataMemory
    }
    if (address <= endOfStack) {
      return this.stack
    }
    return this.heapMemory
  }

  private readMemory(address: number): number {
    const mem = this.resolveMemory(address)
    return mem.get(address)
  }

  private setMemory(address: number, value: number) {
    const mem = this.resolveMemory(address)
    mem.set(address, value)
  }
}