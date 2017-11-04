import { expect } from 'chai'
import Lexer from '../../src/parse/Lexer'

const source = `
.data
# A comment
foo: .ascii "bar, bang:"
bar: .byte 'h','e','l','l','o','\0'
.text
main:
li $v0, 4
la $a0, foo
syscall

addi $sp, $sp, -4
li $t0, 10

sw $t0, 0($sp) # Another comment

li $v0, 1
lw $a0, 0($sp)
syscall

addi $sp, $sp, 4

li $v0, 10
syscall
`

const expected = [
  { type: 'TEXT', value: '.data', lineno: 2, colno: 1 },
  { type: 'EOL', value: '\n', lineno: 2, colno: 6 },
  { type: 'TEXT', value: 'foo', lineno: 4, colno: 1 },
  { type: 'COLON', value: ':', lineno: 4, colno: 4 },
  { type: 'TEXT', value: '.ascii', lineno: 4, colno: 6 },
  { type: 'STRING', value: '"bar, bang:"', lineno: 4, colno: 13 },
  { type: 'EOL', value: '\n', lineno: 4, colno: 13 },
  { type: 'TEXT', value: 'bar', lineno: 5, colno: 1 },
  { type: 'COLON', value: ':', lineno: 5, colno: 4 },
  { type: 'TEXT', value: '.byte', lineno: 5, colno: 6 },
  { type: 'CHAR', value: '\'h\'', lineno: 5, colno: 12 },
  { type: 'COMMA', value: ',', lineno: 5, colno: 12 },
  { type: 'CHAR', value: '\'e\'', lineno: 5, colno: 13 },
  { type: 'COMMA', value: ',', lineno: 5, colno: 13 },
  { type: 'CHAR', value: '\'l\'', lineno: 5, colno: 14 },
  { type: 'COMMA', value: ',', lineno: 5, colno: 14 },
  { type: 'CHAR', value: '\'l\'', lineno: 5, colno: 15 },
  { type: 'COMMA', value: ',', lineno: 5, colno: 15 },
  { type: 'CHAR', value: '\'o\'', lineno: 5, colno: 16 },
  { type: 'COMMA', value: ',', lineno: 5, colno: 16 },
  { type: 'CHAR', value: '\'\0\'', lineno: 5, colno: 17 },
  { type: 'EOL', value: '\n', lineno: 5, colno: 17 },
  { type: 'TEXT', value: '.text', lineno: 6, colno: 1 },
  { type: 'EOL', value: '\n', lineno: 6, colno: 6 },
  { type: 'TEXT', value: 'main', lineno: 7, colno: 1 },
  { type: 'COLON', value: ':', lineno: 7, colno: 5 },
  { type: 'EOL', value: '\n', lineno: 7, colno: 6 },
  { type: 'TEXT', value: 'li', lineno: 8, colno: 1 },
  { type: 'TEXT', value: '$v0', lineno: 8, colno: 4 },
  { type: 'COMMA', value: ',', lineno: 8, colno: 7 },
  { type: 'TEXT', value: '4', lineno: 8, colno: 9 },
  { type: 'EOL', value: '\n', lineno: 8, colno: 10 },
  { type: 'TEXT', value: 'la', lineno: 9, colno: 1 },
  { type: 'TEXT', value: '$a0', lineno: 9, colno: 4 },
  { type: 'COMMA', value: ',', lineno: 9, colno: 7 },
  { type: 'TEXT', value: 'foo', lineno: 9, colno: 9 },
  { type: 'EOL', value: '\n', lineno: 9, colno: 12 },
  { type: 'TEXT', value: 'syscall', lineno: 10, colno: 1 },
  { type: 'EOL', value: '\n', lineno: 10, colno: 8 },
  { type: 'TEXT', value: 'addi', lineno: 12, colno: 1 },
  { type: 'TEXT', value: '$sp', lineno: 12, colno: 6 },
  { type: 'COMMA', value: ',', lineno: 12, colno: 9 },
  { type: 'TEXT', value: '$sp', lineno: 12, colno: 11 },
  { type: 'COMMA', value: ',', lineno: 12, colno: 14 },
  { type: 'TEXT', value: '-4', lineno: 12, colno: 16 },
  { type: 'EOL', value: '\n', lineno: 12, colno: 18 },
  { type: 'TEXT', value: 'li', lineno: 13, colno: 1 },
  { type: 'TEXT', value: '$t0', lineno: 13, colno: 4 },
  { type: 'COMMA', value: ',', lineno: 13, colno: 7 },
  { type: 'TEXT', value: '10', lineno: 13, colno: 9 },
  { type: 'EOL', value: '\n', lineno: 13, colno: 11 },
  { type: 'TEXT', value: 'sw', lineno: 15, colno: 1 },
  { type: 'TEXT', value: '$t0', lineno: 15, colno: 4 },
  { type: 'COMMA', value: ',', lineno: 15, colno: 7 },
  { type: 'TEXT', value: '0', lineno: 15, colno: 9 },
  { type: 'LEFT_PAREN', value: '(', lineno: 15, colno: 10 },
  { type: 'TEXT', value: '$sp', lineno: 15, colno: 11 },
  { type: 'RIGHT_PAREN', value: ')', lineno: 15, colno: 14 },
  { type: 'EOL', value: '\n', lineno: 15, colno: 33 },
  { type: 'TEXT', value: 'li', lineno: 17, colno: 1 },
  { type: 'TEXT', value: '$v0', lineno: 17, colno: 4 },
  { type: 'COMMA', value: ',', lineno: 17, colno: 7 },
  { type: 'TEXT', value: '1', lineno: 17, colno: 9 },
  { type: 'EOL', value: '\n', lineno: 17, colno: 10 },
  { type: 'TEXT', value: 'lw', lineno: 18, colno: 1 },
  { type: 'TEXT', value: '$a0', lineno: 18, colno: 4 },
  { type: 'COMMA', value: ',', lineno: 18, colno: 7 },
  { type: 'TEXT', value: '0', lineno: 18, colno: 9 },
  { type: 'LEFT_PAREN', value: '(', lineno: 18, colno: 10 },
  { type: 'TEXT', value: '$sp', lineno: 18, colno: 11 },
  { type: 'RIGHT_PAREN', value: ')', lineno: 18, colno: 14 },
  { type: 'EOL', value: '\n', lineno: 18, colno: 15 },
  { type: 'TEXT', value: 'syscall', lineno: 19, colno: 1 },
  { type: 'EOL', value: '\n', lineno: 19, colno: 8 },
  { type: 'TEXT', value: 'addi', lineno: 21, colno: 1 },
  { type: 'TEXT', value: '$sp', lineno: 21, colno: 6 },
  { type: 'COMMA', value: ',', lineno: 21, colno: 9 },
  { type: 'TEXT', value: '$sp', lineno: 21, colno: 11 },
  { type: 'COMMA', value: ',', lineno: 21, colno: 14 },
  { type: 'TEXT', value: '4', lineno: 21, colno: 16 },
  { type: 'EOL', value: '\n', lineno: 21, colno: 17 },
  { type: 'TEXT', value: 'li', lineno: 23, colno: 1 },
  { type: 'TEXT', value: '$v0', lineno: 23, colno: 4 },
  { type: 'COMMA', value: ',', lineno: 23, colno: 7 },
  { type: 'TEXT', value: '10', lineno: 23, colno: 9 },
  { type: 'EOL', value: '\n', lineno: 23, colno: 11 },
  { type: 'TEXT', value: 'syscall', lineno: 24, colno: 1 },
  { type: 'EOS', value: '%EOS%', lineno: 25, colno: 1 },
]

describe('Lexer', () => {
  it('basic', () => {
    const lexer = new Lexer(source)
    const tokens = lexer.lex()
    expect(tokens).to.deep.equal(expected)
  })

  it('end-of-line comments', () => {
    const source = `
      li $s0, 5 # foo
      la $s1, bar
    `
    const lexer = new Lexer(source)
    const tokens = lexer.lex()

    expect(tokens).to.deep.equal([
      { type: 'TEXT', value: 'li', lineno: 2, colno: 7 },
      { type: 'TEXT', value: '$s0', lineno: 2, colno: 10 },
      { type: 'COMMA', value: ',', lineno: 2, colno: 13 },
      { type: 'TEXT', value: '5', lineno: 2, colno: 15 },
      { type: 'EOL', value: '\n', lineno: 2, colno: 22 },
      { type: 'TEXT', value: 'la', lineno: 3, colno: 7 },
      { type: 'TEXT', value: '$s1', lineno: 3, colno: 10 },
      { type: 'COMMA', value: ',', lineno: 3, colno: 13 },
      { type: 'TEXT', value: 'bar', lineno: 3, colno: 15 },
      { type: 'EOS', value: '%EOS%', lineno: 4, colno: 5 },
    ])
  })
})