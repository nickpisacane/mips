import Instruction from '../Instruction'

export default class AssembledObject {
  // map of labels to addresses
  public symbols: { [key: string]: number }
  // map of addresses to labels, with the address being that of a j or jal op and the labels being
  // that of the target instruction (where to jump)
  public relocations: { [key: number]: string }
  public data: Uint8Array
  public instructions: Uint32Array
  public objInstructions: Instruction[]
}