import * as AST from '../parse/AST'
import Assembler from './Assembler'
import AssembledObject from './AssmebledObject'

export default function assemble(root: AST.Root): AssembledObject {
  const assembler = new Assembler(root)
  return assembler.assemble()
}