import { Readable, Writable } from 'stream'
import { expect } from 'chai'

import { Collector } from '../helpers'

import MIPS from '../../src/Runtime/MIPS'

describe('MIPS', () => {
  it('works', async () => {
    const source = `
      .data
    message: .asciiz "Hello, World"
      .text
    main:
      li $v0, 4
      la $a0, message
      syscall
    `
    const stdout = new Collector()
    const stderr = new Collector()

    const mips = new MIPS({
      source,
      stdout,
      stderr,
      stdin: process.stdin as any,
    })

    await mips.execute()

    expect(stdout.toString()).to.equal('Hello, World')
  })

  it('works again', async () => {
    const source = `
      .text
    main:
      li $s0, 32
      li $s1, 10
      add $a0, $s0, $s1
      li $v0, 1
      syscall
    `
    const stdout = new Collector()
    const stderr = new Collector()

    const mips = new MIPS({
      source,
      stdout,
      stderr,
      stdin: process.stdin as any,
    })

    await mips.execute()

    expect(stdout.toString()).to.equal('42')
  })
})