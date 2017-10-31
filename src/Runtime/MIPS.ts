import { EventEmitter } from 'events'
import { Readable, Writable } from 'stream'

import parse from '../parse'
import assemble from '../assemble'
import AssembledObject from '../assemble/AssmebledObject'
import * as mappings from '../utils/mappings'
import Instruction from '../Instruction'

import PrimaryRegisters from './PrimaryRegisters'
import * as constants from './constants'

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
  private stdin: Readable
  private stdout: Writable
  private stderr: Writable
  private source: string
  private compiled: boolean

  private assembledObj: AssembledObject
  private primaryRegisters: PrimaryRegisters

  constructor(options: MIPSOptions) {
    super()

    this.stdin = options.stdin
    this.stdout = options.stdout
    this.stderr = options.stderr
    this.source = options.source

    this.primaryRegisters = new PrimaryRegisters()
    this.compiled = false
  }

  private compile() {
    this.assembledObj = assemble(parse(this.source))
    this.compiled = true
  }

  public start() {
    this.compile()
  }

  public executeNextInstruction() {
    const index = this.resolveInstructionIndex()
    if (index >= this.assembledObj.objInstructions.length) {
      throw new Error(`Out of range`)
    }
    const instr = this.assembledObj.objInstructions[index]
    this.executeInstruction(instr)

    this.primaryRegisters.set('pc', this.primaryRegisters.get('pc') + 4)
  }

  private executeInstruction(instr: Instruction) {
    // TODO: Implement
  }

  private resolveInstructionIndex(): number {
    const pc = this.primaryRegisters.get('pc')
    return (pc - constants.BASE_TEXT_ADDR) / 4
  }
}