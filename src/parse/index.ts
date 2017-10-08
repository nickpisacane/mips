import * as AST from './AST'
import Parser from './Parser'
import Lexer from './Lexer'

export default function parse(source: string): AST.Root {
  const lexer = new Lexer(source)
  const tokens = lexer.lex()
  const parser = new Parser(tokens)
  
  return parser.parse()
}