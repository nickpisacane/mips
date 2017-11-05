import { expect } from 'chai'
import * as AST from '../../src/parse/AST'
import Lexer from '../../src/parse/Lexer'
import Parser from '../../src/parse/Parser'

describe('Parser', () => {
  it('transforms psuedo-instructions', () => {
    const source = `
    bge $t1, $t2, end
    `
    const expectedChildren = [
      new AST.TransformedNode([
        new AST.OperationNode('slt', [
          new AST.RegisterNode('$at'),
          new AST.RegisterNode('$t1'),
          new AST.RegisterNode('$t2'),
        ]),
        new AST.OperationNode('beq', [
          new AST.RegisterNode('$at'),
          new AST.RegisterNode('$0'),
          new AST.AddressNode('end'),
        ]),
      ], new AST.OperationNode('bge', [
        new AST.RegisterNode('$t1'),
        new AST.RegisterNode('$t2'),
        new AST.AddressNode('end'),
      ])),
    ]

    const tokens = new Lexer(source).lex()
    const parser = new Parser(tokens)
    const ast = parser.parse()

    expect(ast.text.children).to.deep.equal(expectedChildren)
  })

  it('transforms immediate instructions', () => {
    const source = `
    addi $t1, $t2, 0xffffffff
    `

    const tokens = new Lexer(source).lex()
    const ast = new Parser(tokens).parse()

    expect(ast.text.children).to.deep.equal([
      new AST.TransformedNode([
        new AST.OperationNode('lui', [
          new AST.RegisterNode('$at'),
          new AST.ImmediateNode((0xffff).toString()),
        ]),
        new AST.OperationNode('ori', [
          new AST.RegisterNode('$at'),
          new AST.RegisterNode('$at'),
          new AST.ImmediateNode((0xffff).toString()),
        ]),
        new AST.OperationNode('add', [
          new AST.RegisterNode('$t1'),
          new AST.RegisterNode('$t2'),
          new AST.RegisterNode('$at'),
        ]),
      ], new AST.OperationNode('addi', [
        new AST.RegisterNode('$t1'),
        new AST.RegisterNode('$t2'),
        new AST.ImmediateNode('0xffffffff'),
      ])),
    ])
  })

  it('transforms negative immediate instructions', () => {
    const source = `
    andi $t1, $t2, -1
    `

    const tokens = new Lexer(source).lex()
    const ast = new Parser(tokens).parse()

    expect(ast.text.children).to.deep.equal([
      new AST.TransformedNode([
        new AST.OperationNode('lui', [
          new AST.RegisterNode('$at'),
          new AST.ImmediateNode((0xffff).toString()),
        ]),
        new AST.OperationNode('ori', [
          new AST.RegisterNode('$at'),
          new AST.RegisterNode('$at'),
          new AST.ImmediateNode((0xffff).toString()),
        ]),
        new AST.OperationNode('and', [
          new AST.RegisterNode('$t1'),
          new AST.RegisterNode('$t2'),
          new AST.RegisterNode('$at'),
        ]),
      ], new AST.OperationNode('andi', [
        new AST.RegisterNode('$t1'),
        new AST.RegisterNode('$t2'),
        new AST.ImmediateNode('-1'),
      ])),
    ])
  })
})