import { Readable, Writable } from 'stream'
import { expect } from 'chai'

import { Input, Output } from '../helpers'

import MIPS from '../../src/runtime/MIPS'
import * as int32 from '../../src/utils/int32'

describe('MIPS', () => {
  it('basic io', async () => {
    const source = `
      .data
    message: .asciiz "Hello, World\n"
    answer: .word 42
      .text
    main:
      li $v0, 4
      la $a0, message
      syscall
      li $v0, 1
      la $t0, answer
      lw $a0, 0($t0)
      syscall
    `
    const stdout = new Output()
    const stderr = new Output()

    const mips = new MIPS({
      source,
      stdout,
      stderr,
      stdin: process.stdin as any,
    })
    mips.assemble()
    await mips.execute()

    expect(stdout.toString()).to.equal('Hello, World\n42')
  })

  it('add', async () => {
    const source = `
      .text
    main:
      li $s0, 32
      li $s1, 10
      add $a0, $s0, $s1
      li $v0, 1
      syscall
    `
    const stdout = new Output()
    const stderr = new Output()

    const mips = new MIPS({
      source,
      stdout,
      stderr,
      stdin: process.stdin as any,
    })
    mips.assemble()
    await mips.execute()

    expect(mips.registers.get('$a0')).to.equal(42)
  })

  it('addi', async () => {
    const source = `
      li $v0, 30
      addi $a0, $v0, 12
    `
    const stdout = new Output()
    const stderr = new Output()

    const mips = new MIPS({
      source,
      stdout,
      stderr,
      stdin: process.stdin as any,
    })
    mips.assemble()

    await mips.execute()

    expect(mips.registers.get('$a0')).to.equal(42)
  })

  it('beq', async () => {
    const source = `
      .data
    message: .asciiz "hello, world"
      .text
    main:
      li $t0, 0

      beq $t0, $0, print
      j exit

    print:
      li $v0, 4
      la $a0, message
      syscall

    exit:
      li $v0, 10
      syscall
    `

    const stdout = new Output()
    const stderr = new Output()

    const mips = new MIPS({
      source,
      stdout,
      stderr,
      stdin: process.stdin as any,
    })
    mips.assemble()

    await mips.execute()

    expect(stdout.toString()).to.equal('hello, world')
  })

  it('exiting', async () => {
    const source = `
    li $v0, 10
    syscall
    li $v0, 1
    li $a0, 1
    syscall
    `
    const stdout = new Output()
    const stderr = new Output()

    const mips = new MIPS({
      source,
      stdout,
      stderr,
      stdin: process.stdin as any,
    })
    mips.assemble()

    await mips.execute()

    expect(stdout.toString()).to.equal('')
  })

  it('jal/jr', async () => {
    const source = `
      .text
    main:
      li $a0, 2
      li $a1, 3
      jal Add

      add $a0, $v0, $0
      li $v0, 1
      syscall

      li $v0, 10
      syscall

    Add:
      add $t0, $a0, $0
      add $t1, $a1, $0
      add $v0, $t0, $t1
      jr $ra
    `

    const stdout = new Output()
    const stderr = new Output()

    const mips = new MIPS({
      source,
      stdout,
      stderr,
      stdin: process.stdin as any,
    })
    mips.assemble()

    await mips.execute()

    expect(stdout.toString()).to.equal('5')
  })

  it('reads int', async () => {
    const source = `
      li $v0, 5
      syscall
    `

    const stdin = new Input('42\n')
    const stdout = new Output()
    const stderr = new Output()

    const mips = new MIPS({
      source,
      stdin,
      stdout,
      stderr,
    })
    mips.assemble()

    await mips.execute()

    expect(mips.registers.get('$v0')).to.equal(42)
  })
})