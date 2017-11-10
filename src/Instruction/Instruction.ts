// The Instruction interface
export default interface Instruction {
  type: string
  toInt(): number
}