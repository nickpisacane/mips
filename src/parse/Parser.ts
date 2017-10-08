import * as AST from './AST'
import { Token, TokenType } from './Token'
import transform from './transform'

const rootLevelDirectives: string[] = [
  '.data',
  '.text',
]

const dataLevelDirectives: string[] = [
  '.word',
  '.asciiz',
  '.ascii',
  '.word',
  '.byte',
  '.space',
  '.float',
  '.double',
]

// TODO: Make errors usefull, i.e. wrap in a class that includes lineno, colno
export default class Parser {
  private tokens: Token[]
  private index: number
  private root: AST.Root
  private inData: boolean

  constructor(tokens: Token[]) {
    this.tokens = tokens
    this.index = 0
    this.root = new AST.Root()
    this.inData = false
  }

  private peek(n: number = 0): Token | undefined {
    return this.tokens[this.index + n]
  }

  private next(): Token {
    return this.tokens[this.index++]
  }

  private nextLine(): Token[] {
    const tokens: Token[] = []
    let token: Token = this.next()

    while (token && token.type !== 'EOS' && token.type !== 'EOL') {
      tokens.push(token)
      token = this.next()
    }

    return tokens
  }

  private addNode(node: AST.Node) {
    if (this.inData) {
      this.root.data.add(node)
    } else {
      this.root.text.add(node)
    }
  }

  private groupByComma(tokens: Token[]): Token[][] {
    const ret: Token[][] = []
    let buf: Token[] = []

    tokens.forEach((t, i) => {
      if (t.type === 'COMMA') {
        if (buf.length) {
          ret.push(buf)
          buf = []
        }
      } else {
        buf.push(t)
        if (i === tokens.length - 1) {
          ret.push(buf)
        }
      }
    })

    return ret
  }

  private normalizeDataValues(tokens: Token[]): string[] {
    const ret: string[] = []
    const group = this.groupByComma(tokens)
    return group.map(g => {
      if (g.length > 1) {
        throw new Error('TODO')
      }
      return g[0].value
    })
  }

  private normalizeArgs(tokens: Token[]): AST.ArgumentNode[] {
    const group = this.groupByComma(tokens)

    return group.map(g => {
      let ret: AST.ArgumentNode

      if (g[0].type !== 'TEXT') {
        throw new Error('Unexpected token TODO')
      }

      if (/^\$/.test(g[0].value)) {
        // Register
        // TODO: Validate group
        ret = new AST.RegisterNode(g[0].value)
      } else if (/^(-?)[0-9]+$/.test(g[0].value)) {
        // Immediate OR Offset
        if (g.length === 1) {
          // Immediate
          ret = new AST.ImmediateNode(g[0].value)
        } else {
          // Offset
          const [ imm, lp, r, rp ] = g
          // TODO: Validate stuff
          ret = new AST.OffsetNode(imm.value, r.value)
        }
      } else {
        // Address
        ret = new AST.AddressNode(g[0].value)
      }

      return ret
    })
  }

  private logTokens(tokens: Token[]) {
    console.log(tokens.map(t => `(${t.type} => ${t.value})`).join(' '))
  }

  private logGroup(group: Token[][]) {
    console.log('GROUP: (START)')
    group.forEach(tokens => this.logTokens(tokens))
    console.log('GROUP: (END)')
  }

  public parse(): AST.Root {
    let line: Token[] = this.nextLine()
    while (line.length) {
      this.logTokens(line)
      let [ first, ...rest ] = line
      this.logTokens(rest)
      if (first.type !== 'TEXT') {
        throw new Error('Unexpected Token Error')
      }

      if (/^\./.test(first.value)) {
        // Directive
        if (!~rootLevelDirectives.indexOf(first.value)) {
          throw new Error('Unknown directive')
        }

        if (rest.length) {
          throw new Error('Unexpected tokens')
        }

        this.inData = first.value === '.data'
      } else {
        let node: AST.Node
        let label: string = ''
        let labelNode: AST.LabelNode | undefined

        if (rest.length && rest[0].type === 'COLON') {
          // Label
          label = first.value
          labelNode = new AST.LabelNode(label)

          if (rest.length > 1) {
            first = rest[1]
            rest = rest.slice(2)
          } else {
            const nextLine = this.nextLine()

            if (!nextLine.length) {
              this.addNode(labelNode)
              continue
            }

            first = nextLine[0]
            rest = nextLine.slice(1)
          }
        }

        this.logTokens(rest)

        if (this.inData) {
          if (first.type !== 'TEXT' && !/^\./.test(first.value)) {
            throw new Error('Bad Data')
          }
          const dataDirective = first.value
          const values = this.normalizeDataValues(rest)
          node = new AST.DataNode(dataDirective, values)
        } else {
          const opName = first.value
          const args = this.normalizeArgs(rest)
          node = new AST.OperationNode(first.value, args)
        }

        if (labelNode) {
          labelNode.add(node)
          this.addNode(labelNode)
        } else {
          this.addNode(node)
        }
      }

      line = this.nextLine()
    }

    transform(this.root)
    return this.root
  }
}