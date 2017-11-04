import parseImmediate from '../utils/parseImmediate'

export type NodeType =
  'DIRECTIVE' |
  'DATA'      |
  'LABEL'     |
  'OPERATION' |
  'IMMEDIATE' |
  'OFFSET'    |
  'REGISTER'  |
  'ADDRESS'   |
  'TRANSFORMED'

export class Node {
  public type: NodeType
  public children: Node[] = []

  constructor(type: NodeType) {
    this.type = type
  }

  public add(node: Node) {
    this.children.push(node)
  }

  public toString(): string {
    return '[MIPS Node]'
  }
}

export class DirectiveNode extends Node {
  public directiveType: 'data' | 'text'

  constructor(directiveType: 'data' | 'text') {
    super('DIRECTIVE')

    this.directiveType = directiveType
  }

  public toString(): string {
    return `.${this.directiveType}`
  }
}

export class DataNode extends Node {
  public dataDirective: string
  public values: string[]

  constructor(dataDirective: string, values: string[]) {
    super('DATA')

    this.dataDirective = dataDirective
    this.values = values
  }

  public toString(): string {
    return this.values.join(', ')
  }
}

export class LabelNode extends Node {
  public name: string

  constructor(name: string) {
    super('LABEL')

    this.name = name
  }

  public toString(): string {
    return `${this.name}:`
  }
}

export class RegisterNode extends Node {
  public name: string

  constructor(name: string) {
    super('REGISTER')

    this.name = name
  }

  public toString(): string {
    return this.name
  }
}

export class ImmediateNode extends Node {
  public value: string

  constructor(value: string) {
    super('IMMEDIATE')

    this.value = value
  }

  public split(): ImmediateNode[] {
    const val = parseImmediate(this.value)
    const upper = (val & 0xffff0000) >>> 16
    const lower = (val & 0x0000ffff)
    const ret: ImmediateNode[] = []

    if (upper > 0) {
      ret.push(new ImmediateNode(upper.toString()))
    }
    ret.push(new ImmediateNode(lower.toString()))

    return ret
  }

  public toString(): string {
    return this.value
  }
}

export class OffsetNode extends Node {
  public offset: string
  public register: string

  constructor(offset: string, register: string) {
    super('OFFSET')

    this.offset = offset
    this.register = register
  }

  public toString(): string {
    return `${this.offset}(${this.register})`
  }
}

export class AddressNode extends Node {
  public label: string
  public partitioned: boolean
  public part: 'upper' | 'lower'

  constructor(label: string) {
    super('ADDRESS')

    this.label = label
    this.partitioned = false
  }

  public partition(part: 'upper' | 'lower'): AddressNode {
    const addr = new AddressNode(this.label)
    addr.partitioned = true
    addr.part = part

    return addr
  }

  public toString(): string {
    return this.label
  }
}

export type ArgumentNode =
  RegisterNode  |
  ImmediateNode |
  OffsetNode    |
  AddressNode

export class OperationNode extends Node {
  public name: string
  public args: ArgumentNode[]

  constructor(name: string, args: ArgumentNode[]) {
    super('OPERATION')

    this.name = name
    this.args = args
  }

  public toString(): string {
    return `${this.name} ${this.args.map(a => a.toString()).join(', ')}`
  }
}

export class Root {
  public data: DirectiveNode
  public text: DirectiveNode

  constructor() {
    this.data = new DirectiveNode('data')
    this.text = new DirectiveNode('text')
  }
}

// Psuedo-instructions will get replaced by these
export class TransformedNode extends Node {
  public original: OperationNode

  constructor(operations: OperationNode[], original: OperationNode) {
    super('TRANSFORMED')

    this.children = operations
    this.original = original
  }

  public toString(): string {
    return this.children.map(c => c.toString()).join('\n')
  }
}

export const utils = {
  isOperationNode: (n: Node): n is OperationNode => n.type === 'OPERATION',
  isLabelNode: (n: Node): n is LabelNode => n.type === 'LABEL',
  isDirectiveNode: (n: Node): n is DirectiveNode => n.type === 'DIRECTIVE',
  isDataNode: (n: Node): n is DataNode => n.type === 'DATA',
  isRegisterNode: (n: Node): n is RegisterNode => n.type === 'REGISTER',
  isImmediateNode: (n: Node): n is ImmediateNode => n.type === 'IMMEDIATE',
  isOffsetNode: (n: Node): n is OffsetNode => n.type === 'OFFSET',
  isAddressNode: (n: Node): n is AddressNode => n.type === 'ADDRESS',
  isTranformedNode: (n: Node): n is TransformedNode => n.type === 'TRANSFORMED',
}