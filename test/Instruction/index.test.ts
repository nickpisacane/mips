import Instruction, { IInstruction, JInstruction, RInstruction, utils } from '../../src/Instruction'
import { expect } from 'chai'

describe('Instruction', () => {
  let instr: any

  describe('Type R instruction', () => {
    before('Creates instruction', () => {
      // 0b00000001010010110100100000100000
      instr = utils.fromInt(0x014b4820)
      console.log('Instruction: ', instr)
    })

    it('Instruction created is of the right type', () => {
      expect(utils.isR(instr)).to.be.true
      expect(instr.type).to.equal('R')
    })

    it('Verifies opcode, rs, rt, rd, shamt and funct', () => {
      // 0b000000 01010 01011 01001 00000 100000
      expect(instr.op).to.equal(0b000000)
      expect(instr.rs).to.equal(0b01010)
      expect(instr.rt).to.equal(0b01011)
      expect(instr.rd).to.equal(0b01001)
      expect(instr.sh).to.equal(0b00000)
      expect(instr.func).to.equal(0x20)
    })
  })

  describe('Type I instruction', () => {
    before('Creates instruction', () => {
      // 0b00100100000000101111111111111111
      instr = utils.fromInt(0x2402ffff)
      console.log('Instruction: ', instr)
    })

    it('Instruction created is of the right type', () => {
      expect(utils.isI(instr)).to.be.true
      expect(instr.type).to.equal('I')
    })

    it('Verifies opcode, rs, rt and immediate', () => {
      // 0b001001 00000 00010 1111111111111111
      expect(instr.op).to.equal(0b001001)
      expect(instr.rs).to.equal(0b00000)
      expect(instr.rt).to.equal(0b00010)
      expect(instr.imm).to.equal(0xffff)
    })
  })

  describe('Type J instruction', () => {
    before('Creates instruction', () => {
      // 0b00001000001011111111111111111111
      instr = utils.fromInt(0x082fffff)
      console.log('Instruction: ', instr)
    })

    it('Instruction created is of the right type', () => {
      expect(utils.isJ(instr)).to.be.true
      expect(instr.type).to.equal('J')
    })

    it('Verifies opcode and address', () => {
      // 0b000010 00 0010 1111 1111 1111 1111 1111
      expect(instr.j).to.equal(0b000010)
      expect(instr.addr).to.equal(0x02fffff)
    })
  })

  describe('Type FR instruction', () => {
    before('Creates instruction', () => {
      // 0b0100 0110 0000 0100 0010 1001 1000 0000
      instr = utils.fromInt(0x46042980)
      console.log('Instruction: ', instr)
    })

    it('Instruction created is of the right type', () => {
      expect(utils.isFR(instr)).to.be.true
      expect(instr.type).to.equal('FR')
    })

    it('Verifies opcode, fmt, ft, fs, fd and funct', () => {
      // 0b010001 10000 00100 00101 00110 000000
      expect(instr.op).to.equal(0x11)
      expect(instr.fmt).to.equal(0x10)
      expect(instr.ft).to.equal(0b00100)
      expect(instr.fs).to.equal(0b00101)
      expect(instr.fd).to.equal(0b00110)
      expect(instr.func).to.equal(0x0)
    })
  })

  describe('Type FI instruction', () => {
    before('Creates instruction', () => {
      // 0b010001 01000 00001 1111111111111111
      instr = utils.fromInt(0x4501ffff)
      console.log('Instruction: ', instr)
    })

    it('Instruction created is of the right type', () => {
      expect(utils.isFI(instr)).to.be.true
      expect(instr.type).to.equal('FI')
    })

    it('Verifies opcode, rs, rt and immediate', () => {
      // 0b010001 01000 00001 1111111111111111
      expect(instr.op).to.equal(0x11)
      expect(instr.fmt).to.equal(0x8)
      expect(instr.ft).to.equal(0x1)
      expect(instr.imm).to.equal(0xffff)
    })
  })
})
