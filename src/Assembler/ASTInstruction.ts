import * as AST from '../parse/AST'

export default class ASTInstruction {
  public label: string
  public node: AST.OperationNode

  constructor(node: AST.OperationNode, label: string = '') {
    this.node = node
    this.label = label
  }
}