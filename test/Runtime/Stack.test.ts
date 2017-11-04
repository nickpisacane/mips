import { expect } from 'chai'

import Stack from '../../src/Runtime/Stack'
import { BASE_STACK_POINTER } from '../../src/Runtime/constants'

describe('Stack', () => {
  it('LIFO', () => {
    const stack = new Stack({
      size: 1024,
      end: BASE_STACK_POINTER,
    })

    expect(stack.getSize()).to.equal(1024)
    stack.set(BASE_STACK_POINTER - 1, 42)
    expect(stack.get(BASE_STACK_POINTER - 1)).to.equal(42)
  })
})