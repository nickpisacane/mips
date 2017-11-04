import { Token, TokenType } from './Token'

export default class Lexer {
  private source: string
  private lineno: number
  private colno: number
  private inComment: boolean
  private value: string
  private tokens: Token[]
  private inQuote: boolean

  constructor(source: string) {
    this.source = source
    this.reset()
  }

  private reset() {
    this.lineno = 1
    this.colno = 1
    this.inComment = false
    this.value = ''
    this.tokens = []
    this.inQuote = false
  }

  private normalizedTokens(): Token[] {
    const ret: Token[] = []

    this.tokens.forEach((t, i) => {
      if (t.type !== 'EOL' || (ret.length && ret[ret.length - 1].type !== 'EOL')) {
        if (t.type === 'EOS' && ret.length && ret[ret.length - 1].type === 'EOL') {
          ret[ret.length - 1] = t
        } else {
          ret.push(t)
        }
      }
    })

    return ret
  }

  private pushSpecial(type: TokenType, value: string) {
    if (this.inComment) return
    this.tokens.push(new Token(type, value, this.lineno, this.colno))
  }

  private flush() {
    if (this.inComment) return
    const value = this.value

    if (!value) return

    const token = new Token('TEXT', value, this.lineno, this.colno - this.value.length)
    this.tokens.push(token)
    this.value = ''
  }

  public lex(): Token[] {
    this.reset()

    this.source.split('').forEach(c => {
      if (!this.inComment && (c === '\'' || c === '"')) {
        this.value += c
        if (this.inQuote) {
          const type: TokenType = /^\'/.test(this.value) ? 'CHAR' : 'STRING'
          this.tokens.push(new Token(type, this.value, this.lineno, this.colno))
          this.value = ''
          this.inQuote = false
        } else {
          this.inQuote = true
        }
        return
      }

      if (this.inQuote) {
        this.value += c
        return
      }

      switch (c) {

        // Special-case tokens
        case ':':
          this.flush()
          this.pushSpecial('COLON', c)
          break
        case '(':
          this.flush()
          this.pushSpecial('LEFT_PAREN', c)
          break
        case ')':
          this.flush()
          this.pushSpecial('RIGHT_PAREN', c)
          break
        case ',':
          this.flush()
          this.pushSpecial('COMMA', c)
          break

        // Comment, whitespace, new-lines
        case '#':
          this.flush()
          this.inComment = true
          break
        case ' ':
        case '\t':
          this.flush()
          break
        case '\n':
          this.flush()
          if (this.inComment) {
            this.inComment = false
          }
          this.pushSpecial('EOL', c)
          this.lineno++
          this.colno = 0
          break

        // Everything else
        default:
          if (!this.inComment) {
            this.value += c
          }
      }


      this.colno++
    })

    this.pushSpecial('EOS', '%EOS%')

    return this.normalizedTokens()
  }
}