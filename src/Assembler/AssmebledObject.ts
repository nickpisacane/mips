import Instruction from '../Instruction'

export default class AssembledObject {
  public symbols: { [key: string]: number }
  public relocations: { [key: string]: number }
  public data: Uint8Array
  public instructions: Uint32Array
  public objInstructions: Instruction[]
}