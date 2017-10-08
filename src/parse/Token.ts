export type TokenType =
  'TEXT'         |
  'LEFT_PAREN'   |
  'RIGHT_PAREN'  |
  'COMMA'        |
  'COLON'        |
  'CHAR'         |
  'STRING'       |
  'EOL'          |
  'EOS'

export class Token {
  public type: TokenType
  public value: string
  public lineno: number
  public colno: number

  constructor(type: TokenType, value: string, lineno: number, colno: number) {
    this.type = type
    this.value = value
    this.lineno = lineno
    this.colno = colno
  }
}
