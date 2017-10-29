import { EventEmitter } from 'events'
import { Readable, Writable } from 'stream'

import parse from '../parse'
import assemble from '../assemble'
import AssembledObject from '../assemble/AssmebledObject'
import * as mappings from '../utils/mappings'

import Registers from './Registers'

export interface MIPSOptions {
  stdin: Readable
  stdout: Writable
  stderr: Writable
  source: string
}

export interface MIPSEmitter {
  // TODO: Define events API
}

const BASE_TEXT_ADDR = 0x00400000
const BASE_DATA_ADDR = 0x10010000
const BASE_STACK_POINTER = 0x7fffeffc

export default class MIPS extends EventEmitter implements MIPSEmitter {
  private stdin: Readable
  private stdout: Writable
  private stderr: Writable
  private source: string

  private assembledObj: AssembledObject
  private registers: Registers

  constructor(options: MIPSOptions) {
    super()

    this.stdin = options.stdin
    this.stdout = options.stdout
    this.stderr = options.stderr
    this.source = options.source

    this.registers = new Registers({
      size: 35,
      mappings: mappings.registers,
    })
    this.registers.set('pc', BASE_TEXT_ADDR)
    this.registers.set('$sp', BASE_STACK_POINTER)
  }

  private compile() {
    this.assembledObj = assemble(parse(this.source))
  }

  public start() {
    this.compile()
  }
}