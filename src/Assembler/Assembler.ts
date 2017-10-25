import * as AST from '../parse/AST'
import ASTInstruction from './ASTInstruction'
import Instruction, {
  utils,
  RInstruction,
  IInstruction,
  JInstruction,
} from '../Instruction'
import {
  registers,
  instructions,
} from '../utils/mappings'

const BASE_TEXT_ADDR = 0x00400000
const BASE_DATA_ADDR = 0x10010000

export default class Assembler {
  private astRoot: AST.Root
  private astInstructions: AST.OperationNode[]
  private objInstructions: Instruction[]
  private instructionLabels: { [key: string]: number } = {}
  private dataLabels: { [key: string]: number } = {}
  private instructions: Uint32Array
  private data: Uint8Array

  constructor(root: AST.Root) {
    this.astRoot = root
  }

  private genData() {
    const dataSize = this.astRoot.data.children.reduce((size: number, node: AST.DataNode) => {
      return 0
    }, 0)
  }

  private genASTInstructions() {
    this.astInstructions = []

    let index = 0
    const walk = (child: AST.Node) => {
      if (AST.utils.isOperationNode(child)) {
        this.astInstructions[index++] = child
      } else if (AST.utils.isLabelNode(child)) {
        this.instructionLabels[child.name] = index + 1
        child.children.forEach(walk)
      } else if (AST.utils.isTranformedNode(child)) {
        child.children.forEach(walk)
      } else {
        console.log('WTF')
      }
    }

    this.astRoot.text.children.forEach(walk)
  }

  private indexOfLabel(node: AST.OperationNode): number {
    for (let i = 0; i < node.args.length; i++) {
      if (AST.utils.isAddressNode(node.args[i])) return i
    }
    return -1
  }

  private interpolateLabels() {
    this.astInstructions.forEach((node, i) => {
      const index = this.indexOfLabel(node)
      if (~index) {
        const addrNode = node.args[index] as AST.AddressNode
        const label = addrNode.label
        let labelIndex: number
        let immediateValue: number = 0

        if (label in this.instructionLabels) {
          labelIndex = this.instructionLabels[label]

          let immediateValue: number
          if (node.name === 'beq' || node.name === 'bne') {
            // Interpolate offset
            immediateValue = (labelIndex - i + 1) * 4
          } else {
            // Interpolate address
            immediateValue = BASE_TEXT_ADDR + (labelIndex * 4)
          }
        } else if (label in this.dataLabels) {
          labelIndex = this.dataLabels[label]
          immediateValue = BASE_DATA_ADDR + labelIndex
        } else {
          throw new Error(`Bad Label: ${label}`)
        }

        node.args[index] = new AST.ImmediateNode(immediateValue.toString())
      }
    })
  }

  private genObjInstructions() {
    this.objInstructions = this.astInstructions.map(node => {

    })
  }
}