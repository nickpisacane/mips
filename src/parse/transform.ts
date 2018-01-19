import * as AST from './AST'

type TransformerFunc = (node: AST.OperationNode) => AST.TransformedNode | AST.OperationNode

const $AT = new AST.RegisterNode('$at')
const $0 = new AST.RegisterNode('$0')

const transformImmediate = (op: AST.OperationNode, rOp: string): AST.TransformedNode | AST.OperationNode => {
  const immNode = op.args[2] as AST.ImmediateNode
  const split = immNode.split()
  // Immediate fits in 16 bits, bail
  if (split.length === 1) return op

  // Pack the immediate value into the $at register, then invoke the associated R-type operation
  // with $at in replacement of immediate
  return new AST.TransformedNode([
    new AST.OperationNode('lui', [ $AT, split[0] ]),
    new AST.OperationNode('ori', [ $AT, $AT, split[1] ]),
    new AST.OperationNode(rOp, [ op.args[0], op.args[1], $AT ]),
  ], op)
}

const transformers: {
  [key: string]: TransformerFunc
} = {
  // bge $rx, $ry, addr =>
  //    slt $at, $rx, $ry
  //    beq $at, $0, addr
  'bge': (op: AST.OperationNode) => new AST.TransformedNode([
    new AST.OperationNode('slt', [ $AT, op.args[0], op.args[1] ]),
    new AST.OperationNode('beq', [ $AT, $0, op.args[2] ]),
  ], op),

  // bgt $rx, $ry, addr =>
  //    slt $at, $ry, $rx
  //    bne $at, $0, addr
  'bgt': (op: AST.OperationNode) => new AST.TransformedNode([
    new AST.OperationNode('slt', [ $AT, op.args[1], op.args[0] ]),
    new AST.OperationNode('bne', [ $AT, $0, op.args[2] ]),
  ], op),

  // ble $rx, $ry, addr =>
  //    slt $at, $ry, $rx
  //    beq $at, $0, addr
  'ble': (op: AST.OperationNode) => new AST.TransformedNode([
    new AST.OperationNode('slt', [ $AT, op.args[1], op.args[0] ]),
    new AST.OperationNode('beq', [ $AT, $0, op.args[2] ]),
  ], op),

  // blt $rx, $ry, addr =>
  //    slt $at, $rx, $ry
  //    bne $at, $0, addr
  'blt': (op: AST.OperationNode) => new AST.TransformedNode([
    new AST.OperationNode('slt', [ $AT, op.args[0], op.args[1] ]),
    new AST.OperationNode('bne', [ $AT, $0, op.args[2] ]),
  ], op),

  // la $rx, addr =>
  //    lui $at, upper(addr)
  //    ori $rx, $at, lower(addr)
  'la': (op: AST.OperationNode) => {
    const addr = op.args[1] as AST.AddressNode

    return new AST.TransformedNode([
      new AST.OperationNode('lui', [ $AT, addr.partition('upper') ]),
      new AST.OperationNode('ori', [ op.args[0], $AT, addr.partition('lower') ]),
    ], op)
  },

  // move $rx, $ry =>
  //    addu $rx, $0, $ry
  'move': (op: AST.OperationNode) => new AST.TransformedNode([
    new AST.OperationNode('addu', [ op.args[0], $0, op.args[1] ]),
  ], op),

  // li $rx, imm =>
  //    addiu $rx, $0, imm
  // OR
  // li $rx, imm =>
  //    lui $at, upper(imm)
  //    ori $rx, $at, lower(imm)
  'li': (op: AST.OperationNode) => {
    const immNode = op.args[1] as AST.ImmediateNode
    const split = immNode.split()
    if (split.length == 1) {
      return new AST.TransformedNode([
        new AST.OperationNode('addiu', [ op.args[0], $0, op.args[1] ]),
      ], op)
    }
    return new AST.TransformedNode([
      new AST.OperationNode('lui', [ $AT, split[0] ]),
      new AST.OperationNode('ori', [ op.args[0], $AT, split[1] ]),
    ], op)
  },

  // addi $rt, $rs, imm ?=>
  //    lui $at, upper(imm)
  //    ori $at, $at, lower(imm)
  //    add $rt, $rs, $at
  'addi': (op: AST.OperationNode) => transformImmediate(op, 'add'),

  // addiu $rt, $rs, imm ?=>
  //    lui $at, upper(imm)
  //    ori $at, $at, lower(imm)
  //    addu $rt, $rs, $at
  'addiu': (op: AST.OperationNode) => transformImmediate(op, 'addu'),

  // andi $rt, $rs, imm ?=>
  //    lui $at, upper(imm)
  //    ori $at, $at, lower(imm)
  //    and $rt, $rs, $at
  'andi': (op: AST.OperationNode) => transformImmediate(op, 'and'),

  // ori $rt, $rs, imm ?=>
  //    lui $at, upper(imm)
  //    ori $at, $at, lower(imm)
  //    or $rt, $rs, $at
  'ori': (op: AST.OperationNode) => transformImmediate(op, 'or'),

  // xori $rt, $rs, imm ?=>
  //    lui $at, upper(imm)
  //    ori $at, $at, lower(imm)
  //    xor $rt, $rs, $at
  'xori': (op: AST.OperationNode) => transformImmediate(op, 'xor'),

  // slti $rt, $rs, imm ?=>
  //    lui $at, upper(imm)
  //    ori $at, $at, lower(imm)
  //    slt $rt, $rs, $at
  'slti': (op: AST.OperationNode) => transformImmediate(op, 'slt'),


  // slti $rt, $rs, imm ?=>
  //    lui $at, upper(imm)
  //    ori $at, $at, lower(imm)
  //    sltu $rt, $rs, $at
  'sltiu': (op: AST.OperationNode) => transformImmediate(op, 'sltu'),

  // sgt $rd, $rs, $rt => slt $rd, $rt, $rs
  'sgt': (op: AST.OperationNode) => new AST.TransformedNode([
    new AST.OperationNode('slt', [ op.args[0], op.args[2], op.args[1] ]),
  ], op),

  // seq $rd, $rs, $rt =>
  //    subu $rd, $rs, $rt
  //    ori  $at, $0, 1
  //    sltu $rd, $rd, $at
  'seq': (op: AST.OperationNode) => new AST.TransformedNode([
    new AST.OperationNode('subu', op.args),
    new AST.OperationNode('ori', [ $AT, $0, new AST.ImmediateNode('1') ]),
    new AST.OperationNode('sltu', [ op.args[0], op.args[0], $AT ]),
  ], op),

  // nop =>
  //    sll $at, $at, $0
  'nop': (op: AST.OperationNode) => new AST.TransformedNode([
    new AST.OperationNode('sll', [ $AT, $AT, $0 ]),
  ], op),
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
      if (node.name in transformers) {
        const transformer = transformers[node.name]
        parent.children[index] = transformer(node)
      }
    }
  })
}