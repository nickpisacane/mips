import * as AST from './AST'

type PsuedoInstructionType =
  'bge'  |
  'bgt'  |
  'ble'  |
  'blt'  |
  'la'   |
  'li'   |
  'move' |
  'nop'

const psuedoOperationNames: string[] = [
  'bge',
  'bgt',
  'ble',
  'blt',
  'la',
  'li',
  'move',
  'nop',
]

type TransformerFunc = (node: AST.OperationNode) => AST.TranformedNode

const $AT = new AST.RegisterNode('$at')
const $0 = new AST.RegisterNode('$0')

const transformers: {
  [key: string]: TransformerFunc
} = {
  // bge $rx, $ry, addr =>
  //    slt $at, $rx, $ry
  //    beq $at, $0, addr
  'bge': (op: AST.OperationNode) => new AST.TranformedNode([
    // slt $at, $rx, $ry
    new AST.OperationNode('slt', [ $AT, op.args[0], op.args[1] ]),
    // beq $at, $0, addr
    new AST.OperationNode('beq', [ $AT, $0, op.args[2] ]),
  ]),

  // bgt $rx, $ry, addr =>
  //    slt $at, $ry, $rx
  //    bne $at, $0, addr
  'bgt': (op: AST.OperationNode) => new AST.TranformedNode([
    new AST.OperationNode('slt', [ $AT, op.args[1], op.args[0] ]),
    new AST.OperationNode('bne', [ $AT, $0, op.args[2] ]),
  ]),

  // ble $rx, $ry, addr =>
  //    slt $at, $ry, $rx
  //    beq $at, $0, addr
  'ble': (op: AST.OperationNode) => new AST.TranformedNode([
    new AST.OperationNode('slt', [ $AT, op.args[1], op.args[0] ]),
    new AST.OperationNode('beq', [ $AT, $0, op.args[2] ]),
  ]),

  // blt $rx, $ry, addr =>
  //    slt $at, $rx, $ry
  //    bne $at, $0, addr
  'blt': (op: AST.OperationNode) => new AST.TranformedNode([
    new AST.OperationNode('slt', [ $AT, op.args[0], op.args[1] ]),
    new AST.OperationNode('bne', [ $AT, $0, op.args[2] ]),
  ]),

  // la $rx, addr =>
  //    lui $at, addr
  //    ori $rx, $at, 0
  'la': (op: AST.OperationNode) => new AST.TranformedNode([
    new AST.OperationNode('lui', [ $AT, op.args[1] ]),
    new AST.OperationNode('ori', [ op.args[0], $AT, new AST.ImmediateNode('0') ]),
  ]),

  // li $rx, imm =>
  //    addiu $rx, $0, imm
  'li': (op: AST.OperationNode) => new AST.TranformedNode([
    new AST.OperationNode('addiu', [ op.args[0], $0, op.args[1] ]),
  ]),

  // move $rx, $ry =>
  //    addu $rx, $0, $ry
  'move': (op: AST.OperationNode) => new AST.TranformedNode([
    new AST.OperationNode('addu', [ op.args[0], $0, op.args[1] ]),
  ]),
}

const isOperationNode = (n: AST.Node): n is AST.OperationNode => (
  n.type === 'OPERATION'
)

export default function transform(root: AST.Root) {
  root.text.children.forEach((child, i) => {
    let node: AST.Node
    let parent: AST.Node
    let index: number

    if (child.type === 'LABEL') {
      parent = child
      node = child.children[0]
      index = 0
    } else {
      node = child
      parent = root.text
      index = i
    }

    if (isOperationNode(node)) {
      if (!!~psuedoOperationNames.indexOf(node.name)) {
        const transformer = transformers[node.name]
        parent.children[index] = transformer(node)
      }
    }
  })
}