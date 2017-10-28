import { expect } from 'chai'

import * as AST from '../../src/parse/AST'
import Data, {
  fromAST
} from '../../src/Data'


describe('Data', () => {
  it('asciiz', () => {
    const str = 'hello, world'
    const node = new AST.DataNode('.asciiz', [str])
    const data = fromAST(node)

    console.log(data)
    console.log(data.toInt8Array())

    expect(data.size()).to.equal(str.length + 1)
    expect(data.type).to.equal('asciiz')
    const bin = data.toInt8Array()
    expect(bin.length).to.equal(str.length + 1)
    str.split('').forEach((c, i) => {
      expect(bin[i]).to.equal(c.charCodeAt(0))
    })
    expect(bin[bin.length - 1]).to.equal(0)
  })

  it('ascii', () => {
    const str = 'hello, world'
    const node = new AST.DataNode('.ascii', [str])
    const data = fromAST(node)

    console.log(data)
    console.log(data.toInt8Array())

    expect(data.size()).to.equal(str.length)
    expect(data.type).to.equal('ascii')
    const bin = data.toInt8Array()
    expect(bin.length).to.equal(str.length)
    str.split('').forEach((c, i) => {
      expect(bin[i]).to.equal(c.charCodeAt(0))
    })
  })

  it('byte', () => {
    const node = new AST.DataNode('.byte', ['0', '1', '2', '3'])
    const data = fromAST(node)
    expect(data.type).to.equal('byte')
    expect(data.size()).to.equal(4)

    const bin = data.toInt8Array()
    expect(bin[0]).to.equal(0)
    expect(bin[1]).to.equal(1)
    expect(bin[2]).to.equal(2)
    expect(bin[3]).to.equal(3)
  })

  it('byte (char)', () => {
    const node = new AST.DataNode('.byte', ['\'A\'', '\'B\'', '\'C\'', '\'\0\''])
    const data = fromAST(node)
    expect(data.type).to.equal('byte')
    expect(data.size()).to.equal(4)

    const bin = data.toInt8Array()
    expect(bin[0]).to.equal(65)
    expect(bin[1]).to.equal(66)
    expect(bin[2]).to.equal(67)
    expect(bin[3]).to.equal(0)
  })

  it('space', () => {
    const node = new AST.DataNode('.space', ['80'])
    const data = fromAST(node)
    expect(data.size()).to.equal(80)
    expect(data.type).to.equal('byte')
  })

  it('word', () => {
    const node = new AST.DataNode('.word', ['42'])
    const data = fromAST(node)

    expect(data.type).to.equal('word')
    expect(data.size()).to.equal(4)

    const bin = data.toInt8Array()
    expect(bin[0]).to.equal(0)
    expect(bin[1]).to.equal(0)
    expect(bin[2]).to.equal(0)
    expect(bin[3]).to.equal(42)
  })

  it('word (negative)', () => {
    const node = new AST.DataNode('.word', ['-1'])
    const data = fromAST(node)

    expect(data.type).to.equal('word')
    expect(data.size()).to.equal(4)

    const bin = data.toInt8Array()
    expect(bin[0]).to.equal(0xff)
    expect(bin[1]).to.equal(0xff)
    expect(bin[2]).to.equal(0xff)
    expect(bin[3]).to.equal(0xff)

    expect(((bin[3] << 24) + (bin[2] << 16) + (bin[1] << 8) + bin[0]) | 0).to.equal(-1)
  })

  it('word (array)', () => {
    const node = new AST.DataNode('.word', ['42', '42'])
    const data = fromAST(node)
    expect(data.type).to.equal('word')
    expect(data.size()).to.equal(8)
  })
})

