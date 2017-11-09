import Binary from './Binary'

type BinaryLike = Binary | Uint8Array | Uint32Array

const toBinary = (binaryLike: BinaryLike) => {
  if (binaryLike instanceof Binary) {
    return binaryLike
  }
  if (binaryLike instanceof Uint32Array) {
    return Binary.fromUint32Array(binaryLike)
  }
  if (binaryLike instanceof Uint8Array) {
    return Binary.fromUint8Array(binaryLike)
  }
}

export interface FloatConversionOptions {
  sizeOfExp: number
  sizeOfMantissa: number
  bias: number
}

export interface FloatToBinaryOptions extends FloatConversionOptions {
  value: number
}

export const floatToBinary = (options: FloatToBinaryOptions): Binary => {
  let { value } = options
  const {
    sizeOfExp,
    sizeOfMantissa,
    bias,
  } = options

  // sign | exp | mantissa
  const size = 1 + sizeOfExp + sizeOfMantissa
  const signBit = value > 0 ? 0 : 1
  const binary = new Binary(size)
  let expValue = Math.floor(Math.log(value) / Math.log(2)) + bias

  value = Math.abs(value)

  // decimal mantissa value
  let dm = value % 1
  // decimal characteristic value
  let dc = value - dm
  const log2 = Math.floor(Math.log(value) / Math.log(2))

  // `bits` is an array that will hold the non-normal "bits" for what will be
  // the mantissa of the float. If `value` is greater than or equal to 1, then
  // the mantissa will have leading bits from the characteristic of the decimal
  // value. Because these are generated in reverse order, we can initialize the
  // `bits` array to be INITIALLY the size of the decimal-characteristic in binary
  // (log2 + 1). For the bits from the decimal-mantissa, they are generated in
  // opposing order and can simply be pushed on the end of the bits array. Thus,
  // by the time the bits are actually being normalized and added to `binary`, it
  // will certainly be longer than the initial size.
  const bits = new Array(log2 <= 0 ? 0 : log2 + 1)

  // Fill `bits` with bits from the decimal-characteristic
  for (let i = bits.length - 1; i >= 0; i--) {
    bits[i] = dc % 2
    dc = (dc / 2) | 0
  }

  // Append `bits` with bits from the decimal-mantissa
  while (dm > 0) {
    const v = dm * 2
    dm = v % 1
    bits.push(v - dm)
  }

  // Normalize -- remove leading 0's
  while (bits[0] === 0) {
    bits.shift()
  }

  // Remove leading 1, and (possibly) truncate the `bits` to fit the `sizeOfMantissa`
  bits.slice(1, 1 + sizeOfMantissa).forEach((bit, i) => {
    binary.setBit(sizeOfMantissa - 1 - i, bit)
  })


  // Fill the `exp` section on `binary`
  const expUpper = sizeOfMantissa + sizeOfExp
  for (let i = sizeOfMantissa; i < expUpper && expValue > 0; i++) {
    binary.setBit(i, expValue % 2)
    expValue = (expValue / 2) | 0
  }

  // Set the `sign` bit section
  binary.setBit(size - 1, signBit)

  return binary
}

export interface FloatFromBinaryOptions extends FloatConversionOptions {
  binary: Binary
}

export const floatFromBinary = (options: FloatFromBinaryOptions): number => {
  const {
    binary,
    sizeOfExp,
    sizeOfMantissa,
    bias,
  } = options

  const exp = binary.getRange(sizeOfMantissa, sizeOfMantissa + sizeOfExp - 1) - bias
  let value = 1
  for (let i = sizeOfMantissa - 1, j = -1; i >= 0; i--, j--) {
    value += binary.getBit(i) * Math.pow(2, j)
  }
  value *= Math.pow(2, exp)
  if (binary.getBit(binary.size - 1)) {
    value *= -1
  }
  return value
}

export const singleFromBinary = (binaryLike: BinaryLike): number => {
  const binary = toBinary(binaryLike)
  // TODO: Implement
  return 42
}

export const doubleFromBinary = (binaryLike: BinaryLike): number => {
  const binary = toBinary(binaryLike)
  // TODO: Implement
  return 42
}

export const singleToBinary = (single: number): Binary => {
  // TODO: Implement
  return new Binary(0)
}

export const doubleToBinary = (double: number): Binary => {
  return new Binary(0)
}