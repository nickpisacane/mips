import Instruction, { utils } from '../../src/Instruction'

describe('Instruction', () => {
  it('works', () => {
    const instr = utils.fromInt(0x2402ffff)
    console.log('Instruction: ', instr)
  })
})