import { expect } from 'chai'

import Binary from '../../src/utils/Binary'

describe('Binary', () => {
  it('rounds size to up nearest multiple of 8', () => {
    const binary = new Binary(7)
    expect(binary.size).to.equal(8)
  })

  it('setByte()', () => {
    const binary = new Binary(8)
    binary.setByte(0, 8)
    expect(binary.getBit(3)).to.equal(1)
  })

  it('getByte()', () => {
    const binary = new Binary(8)
    binary.setBit(0, 1)
    binary.setBit(3, 1)
    expect(binary.getByte(0)).to.equal(9)
  })

  it('setBit()', () => {
    const binary = new Binary(8)
    binary.setBit(0, 1)
    expect(binary.getBit(0)).to.equal(1)

    binary.setBit(0, 0)
    expect(binary.getBit(0)).to.equal(0)
  })

  it('getRange()', () => {
    const binary = new Binary(8)
    binary.setBit(0, 1)
    binary.setBit(1, 1)
    binary.setBit(3, 1)

    expect(binary.getByte(0)).to.equal(11)
    expect(binary.getRange(1, 2)).to.equal(1)
    expect(binary.getRange(0, 2)).to.equal(3)
    expect(binary.getRange(0, 3)).to.equal(11)
  })

  it('getValue()', () => {
    const binary = Binary.fromArray([1, 1, 1, 1])
    expect(binary.getValue()).to.equal(15)

    binary.setBit(0, 0)
    expect(binary.getValue()).to.equal(14)
  })

  // TODO: More tests
})