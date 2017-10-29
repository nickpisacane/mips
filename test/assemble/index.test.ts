import { expect } from 'chai'

import assemble from '../../src/assemble'
import parse from '../../src/parse'
import {
  IInstruction,
  JInstruction,
  RInstruction,
} from '../../src/Instruction'
import {
  registers,
  instructions,
} from '../../src/utils/mappings'

describe('assmeble', () => {
  it('works', () => {
    const ast = parse(`
        .data
      foo: .word 42
      bar: .asciiz "foo"
        .text
      main:
        li $t0, 20
        li $t1, 22
        add $t2, $t0, $t1
      check:
        li $t3, 42
        beq $t2, $t3, exit

        j check
      exit:
        li $v0, 4
        la $a0, bar
        syscall

        li $v0, 10
        syscall
    `)
    const obj = assemble(ast)

    expect(obj.data[0]).to.equal(0)
    expect(obj.data[1]).to.equal(0)
    expect(obj.data[2]).to.equal(0)
    expect(obj.data[3]).to.equal(42)
    expect(obj.data[4]).to.equal('f'.charCodeAt(0))
    expect(obj.data[5]).to.equal('o'.charCodeAt(0))
    expect(obj.data[6]).to.equal('o'.charCodeAt(0))
    expect(obj.data[7]).to.equal(0)

    console.log(obj.symbols)
    console.log(obj.relocations)

    console.log(obj.objInstructions[7])

    // reloctions
    expect(obj.relocations[0x00400014]).to.equal('check')
    expect(Object.keys(obj.relocations)).to.deep.equal([(0x00400014).toString()])

    // symbols
    expect(['foo', 'bar', 'main', 'check', 'exit'].sort()).to.deep.equal(
      Object.keys(obj.symbols).sort()
    )

    // address of bar data
    const barAddress = 0x10010000 + 4

    // instructions
    expect(obj.objInstructions.length).to.equal(12)
    expect(obj.objInstructions[0]).to.deep.equal(
      new IInstruction(instructions.addiu.code, 0, registers.$t0, 20)
    )
    expect(obj.objInstructions[1]).to.deep.equal(
      new IInstruction(instructions.addiu.code, 0, registers.$t1, 22)
    )
    expect(obj.objInstructions[2]).to.deep.equal(
      new RInstruction(0, registers.$t0, registers.$t1, registers.$t2, 0, instructions.add.code)
    )
    expect(obj.objInstructions[3]).to.deep.equal(
      new IInstruction(instructions.addiu.code, 0, registers.$t3, 42)
    )
    expect(obj.objInstructions[4]).to.deep.equal(
      new IInstruction(instructions.beq.code, registers.$t3, registers.$t2, 1)
    )
    expect(obj.objInstructions[5]).to.deep.equal(
      new JInstruction(instructions.j.code, 0x0040000c)
    )
    expect(obj.objInstructions[6]).to.deep.equal(
      new IInstruction(instructions.addiu.code, 0, registers.$v0, 4)
    )
    expect(obj.objInstructions[7]).to.deep.equal(
      new IInstruction(instructions.lui.code, 0, registers.$at, (barAddress & 0xffff0000) >>> 16)
    )
    expect(obj.objInstructions[8]).to.deep.equal(
      new IInstruction(instructions.ori.code, registers.$at, registers.$a0, barAddress & 0x0000ffff)
    )
    expect(obj.objInstructions[9]).to.deep.equal(
      new RInstruction(0, 0, 0, 0, 0, instructions.syscall.code)
    )
    expect(obj.objInstructions[10]).to.deep.equal(
      new IInstruction(instructions.addiu.code, 0, registers.$v0, 10)
    )
    expect(obj.objInstructions[11]).to.deep.equal(
      new RInstruction(0, 0, 0, 0, 0, instructions.syscall.code)
    )
  })
})