import { expect } from 'chai'

import Binary from '../../src/utils/Binary'

describe('Binary', () => {
  it('rounds size to up nearest multiple of 8', () => {
    const binary = new Binary(7)
    expect(binary.size).to.equal(8)
  })

  it('setByte()', () => {
    const binary = new Binary(16)
    binary.setByte(0, 8)
    // 00000000 00001000
    binary.setByte(1, 9)
    // 00001001 00001000

    expect(binary.getBit(3)).to.equal(1)

    expect(binary.getBit(8)).to.equal(1)
    expect(binary.getBit(11)).to.equal(1)
  })

  it('getByte()', () => {
    const binary = new Binary(16)
    binary.setBit(0, 1)
    binary.setBit(3, 1)
    binary.setBit(8, 1)
    // => 00000001 00001001

    expect(binary.getByte(0)).to.equal(9)
    expect(binary.getByte(1)).to.equal(1)
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

  it('fromNumber()', () => {
    let binary = Binary.fromNumber(42)
    expect(binary.size).to.equal(8)
    expect(binary.toString()).to.equal('101010')
    expect(binary.getValue()).to.equal(42)

    binary = Binary.fromNumber(Math.pow(2, 32) - 1)
    expect(binary.size).to.equal(32)
    expect(binary.toString()).to.equal(
      '11111111111111111111111111111111'
    )
    expect(binary.getValue()).to.equal(Math.pow(2, 32) - 1)
  })

  it('toString() returns the string value binary number', () => {
    const binary = Binary.fromArray([1, 0, 1, 0, 1, 0])
    expect(binary.toString()).to.equal('101010')
    expect(binary.toString(16)).to.equal('2a')
  })

  it('toUint8Array()', () => {
    const binary = Binary.fromNumber(258)
    // 00000001 000000010
    //     0        1
    const arr = binary.toUint8Array()
    expect(arr[0]).to.equal(1)
    expect(arr[1]).to.equal(2)
  })

  it('toUint32Array()', () => {
    const binary = Binary.fromNumber(Math.pow(2, 32) + 2)
    // 00000000 00000000 00000000 00000001 | 00000000 00000000 00000000 00000010
    //                  0                                     1
    const arr = binary.toUint32Array()
    expect(arr[0]).to.equal(1)
    expect(arr[1]).to.equal(2)
  })

  it('fromUint8Array()', () => {
    const arr = new Uint8Array(2)
    arr[0] = 1
    arr[1] = 42
    // 00000001 00101010
    //    0        1
    const binary = Binary.fromUint8Array(arr)
    expect(binary.getValue()).to.equal(256 + 42)
    expect(binary.getByte(0)).to.equal(42)
    expect(binary.getByte(1)).to.equal(1)
  })

  it('fromUint32Array()', () => {
    const arr = new Uint32Array(2)
    arr[0] = 1
    arr[1] = 2
    // 00000000 00000000 00000000 00000001 | 00000000 00000000 00000000 00000010
    //                  0                                     1
    const binary = Binary.fromUint32Array(arr)
    expect(binary.getValue()).to.equal(Math.pow(2, 32) + 2)
    expect(binary.getByte(0)).to.equal(2)
    expect(binary.getByte(4)).to.equal(1)
  })
})