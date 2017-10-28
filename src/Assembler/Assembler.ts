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
import parseImmediate from '../utils/parseImmediate'
import { fromAST } from '../Data'
import AssembledObject from './AssmebledObject'

const BASE_TEXT_ADDR = 0x00400000
const BASE_DATA_ADDR = 0x10010000

const invertIndexTable = (t: { [key: string]: number }): { [key: number]: string } => {
  const ret: { [key: number]: string } = {}
  Object.keys(t).forEach(k => {
    ret[t[k]] = k
  })
  return ret
}

export default class Assembler {
  private astRoot: AST.Root
  private astInstructions: AST.OperationNode[]
  private objInstructions: Instruction[]
  private instructionLabels: { [key: string]: number } = {}
  private dataLabels: { [key: string]: number } = {}
  private symbols: { [key: string]: number } = {}
  private relocations: { [key: number]: string } = {}
  private instructions: Uint32Array
  private data: Uint8Array

  constructor(root: AST.Root) {
    this.astRoot = root
  }

  private genData() {
    let dataIndex = 0
    const allData = this.astRoot.data.children.map((node: AST.Node) => {
      if (AST.utils.isDataNode(node)) {
        const data = fromAST(node)
        dataIndex += data.size()
        return data
      } else if (AST.utils.isLabelNode(node)) {
        const label = node.name
        const firstChild = node.children[0]
        if (firstChild && AST.utils.isDataNode(firstChild)) {
          const data = fromAST(firstChild)
          this.dataLabels[label] = dataIndex
          dataIndex += data.size()
          return data
        } else {
          throw new Error('This should not happen')
        }
      } else {
        throw new Error('This should not happen')
      }
    })

    const size = allData.reduce((a, b) => a + b.size(), 0)
    this.data = new Uint8Array(size)

    let index = 0
    allData.forEach(data => {
      const segment = data.toInt8Array()
      for (let i = 0; i < segment.length; i++) {
        this.data[index++] = segment[i]
      }
    })
  }

  private genASTInstructions() {
    this.astInstructions = []

    let index = 0
    const walk = (child: AST.Node) => {
      if (AST.utils.isOperationNode(child)) {
        this.astInstructions[index++] = child
      } else if (AST.utils.isLabelNode(child)) {
        console.log('label: ', child.name, index)
        this.instructionLabels[child.name] = index
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

  private genSymbolTable() {
    const invertedInstructionLabels = invertIndexTable(this.instructionLabels)
    this.symbols = {}

    this.astInstructions.forEach((op, i) => {
      if (i in invertedInstructionLabels) {
        const addr = BASE_TEXT_ADDR + i * 4
        this.symbols[invertedInstructionLabels[i]] = addr
      }
    })

    Object.keys(this.dataLabels).forEach(label => {
      this.symbols[label] = BASE_DATA_ADDR + this.dataLabels[label]
    })
  }

  private genRelocationTable() {
    this.relocations = {}
    this.astInstructions.forEach((op, i) => {
      const index = this.indexOfLabel(op)
      if ((op.name === 'j' || op.name == 'jal') && ~index) {
        const addrNode = op.args[index] as AST.AddressNode
        console.log(addrNode.label, this.symbols[addrNode.label])
        if ((addrNode.label in this.symbols)) {
          const addr = BASE_TEXT_ADDR + i * 4
          this.relocations[addr] = addrNode.label
        } else {
          // TODO: better error
          throw new Error(`Invalid Jump`)
        }
      }
    })
  }

  // TODO: clean up
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
          if (node.name === 'beq' || node.name === 'bne') {
            // Interpolate offset
            immediateValue = labelIndex - i - 1
          } else {
            // Interpolate address
            immediateValue = BASE_TEXT_ADDR + labelIndex * 4
          }
        } else if (label in this.dataLabels) {
          labelIndex = this.dataLabels[label]
        } else {
          throw new Error(`Bad Label: ${label}`)
        }

        console.log(`(${node.name}): ${addrNode.label} => ${immediateValue}`)
        node.args[index] = new AST.ImmediateNode(immediateValue.toString())
      }
    })
  }

  private genObjInstructions() {
    this.objInstructions = this.astInstructions.map(node => {
      const info = instructions[node.name]
      // TODO: Better errors
      if (!info) throw new Error('This should not happen')

      let rs: number
      let rt: number
      let rd: number

      if (info.type === 'R') {
        switch (node.name) {
          case 'syscall':
            return new RInstruction(0, 0, 0, 0, 0, info.code)
          case 'jr':
          case 'jalr':
            rs = registers[(node.args[0] as AST.RegisterNode).name]
            return new RInstruction(0, rs, 0, 0, 0, info.code)
          case 'mfhi':
          case 'mflo':
            rd = registers[(node.args[0] as AST.RegisterNode).name]
            return new RInstruction(0, 0, 0, rd, 0, info.code)
          case 'mult':
          case 'div':
          case 'multu':
          case 'divu':
            rs = registers[(node.args[0] as AST.RegisterNode).name]
            rt = registers[(node.args[1] as AST.RegisterNode).name]
            return new RInstruction(0, rs, rt, 0, 0, info.code)
          case 'sll':
          case 'srl':
          case 'sra':
            rd = registers[(node.args[0] as AST.RegisterNode).name]
            rt = registers[(node.args[1] as AST.RegisterNode).name]
            const sh = parseImmediate((node.args[2] as AST.ImmediateNode).value)
            return new RInstruction(0, 0, rt, 0, sh, info.code)
          case 'sllv':
          case 'srlv':
          case 'srav':
            rd = registers[(node.args[0] as AST.RegisterNode).name]
            rt = registers[(node.args[1] as AST.RegisterNode).name]
            rs = registers[(node.args[2] as AST.RegisterNode).name]
            return new RInstruction(0, rs, rt, rd, 0, info.code)
          default:
            rd = registers[(node.args[0] as AST.RegisterNode).name]
            rs = registers[(node.args[1] as AST.RegisterNode).name]
            rt = registers[(node.args[2] as AST.RegisterNode).name]
            return new RInstruction(0, rs, rt, rd, 0, info.code)
        }
      }
      if (info.type === 'I') {
        let imm: number
        switch (node.name) {
          case 'lui':
            rt = registers[(node.args[0] as AST.RegisterNode).name]
            imm = parseImmediate((node.args[1] as AST.ImmediateNode).value)
            return new IInstruction(info.code, 0, rt, imm)
          case 'lb':
          case 'lbu':
          case 'lh':
          case 'lhu':
          case 'lw':
          case 'sb':
          case 'sh':
          case 'sw':
            rt = registers[(node.args[0] as AST.RegisterNode).name]
            imm = parseImmediate((node.args[1] as AST.ImmediateNode).value)
            rs = registers[(node.args[2] as AST.RegisterNode).name]
            return new IInstruction(info.code, rs, rt, imm)
          default:
            rt = registers[(node.args[0] as AST.RegisterNode).name]
            rs = registers[(node.args[1] as AST.RegisterNode).name]
            imm = parseImmediate((node.args[2] as AST.ImmediateNode).value)
            return new IInstruction(info.code, rs, rt, imm)
        }
      }
      if (info.type === 'J') {
        console.log(node.args[0])
        const addr = parseImmediate((node.args[0] as AST.ImmediateNode).value)
        return new JInstruction(info.code, addr)
      }

      // TODO: Better errors
      throw new Error('This should not happen')
    })
  }


  private genInstructions() {
    this.instructions = new Uint32Array(this.objInstructions.length)
    this.objInstructions.forEach((obj, i) => {
      this.instructions[i] = obj.toInt()
    })
  }

  public assemble(): AssembledObject {
    const ret = new AssembledObject()
    this.genData()
    this.genASTInstructions()
    this.genSymbolTable()
    this.genRelocationTable()
    this.interpolateLabels()
    this.genObjInstructions()
    this.genInstructions()

    ret.symbols = this.symbols
    ret.relocations = this.relocations
    ret.data = this.data
    ret.instructions = this.instructions
    ret.objInstructions = this.objInstructions

    return ret
  }
}