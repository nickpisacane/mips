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

export const binaryFromSingle = (single: number): Binary => {
  // TODO: Implement
  return new Binary(0)
}

export const binaryFromDouble = (double: number): Binary => {
  return new Binary(0)
}