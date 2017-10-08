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
      new AST.TranformedNode([
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
      ]),
    ]

    const tokens = new Lexer(source).lex()
    const parser = new Parser(tokens)
    const ast = parser.parse()

    expect(ast.text.children).to.deep.equal(expectedChildren)
  })
})