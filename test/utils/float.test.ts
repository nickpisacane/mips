import { expect } from 'chai'

import * as float from '../../src/utils/float'

// @see: http://www.exploringbinary.com/floating-point-converter/

describe('float', () => {
  it('positive, gte 1 (single)', () => {
    const expected = 0x4229ae14
    const single = float.singleToBinary(42.42)
    expect(single.getValue()).to.equal(expected)
  })

  it('positive, gte 1 (double)', () => {
    const expected = 0x404535c28f5c28f6
    const double = float.doubleToBinary(42.42)
    expect(double.getValue()).to.equal(expected)
  })

  // TODO: More tests
})