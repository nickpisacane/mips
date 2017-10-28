import { expect } from 'chai'

import Assembler from '../../src/Assembler/Assembler'
import parse from '../../src/parse'

describe('Assembler', () => {
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
        li $v0, 10
        syscall
    `)

    // console.log(JSON.stringify(ast, null, 2))
    const assembler = new Assembler(ast)
    const assembled = assembler.assemble()

    expect(assembled.data[0]).to.equal(0)
    expect(assembled.data[1]).to.equal(0)
    expect(assembled.data[2]).to.equal(0)
    expect(assembled.data[3]).to.equal(42)
    expect(assembled.data[4]).to.equal('f'.charCodeAt(0))
    expect(assembled.data[5]).to.equal('o'.charCodeAt(0))
    expect(assembled.data[6]).to.equal('o'.charCodeAt(0))
    expect(assembled.data[7]).to.equal(0)

    // reloctions
    expect(assembled.relocations['check']).to.equal(0x0040000c)
    expect(Object.keys(assembled.relocations)).to.deep.equal(['check'])
  })
})