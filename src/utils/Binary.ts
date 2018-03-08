/**
 * Binary (Big Endian)
 */
export default class Binary {
  public readonly size: number
  private buf: Uint8Array

  constructor(size: number) {
    size = Math.floor(size)
    this.size = size % 8 === 0 ? size : size + (8 - (size % 8))
    this.buf = new Uint8Array(this.size / 8)
  }

  /**
   * Get the BYTE-based index for internal Uint8Array of a given 0-based position
   * from the RIGHT of the binary number.
   * @example  buf = 00000000 11111111
   *                        ^
   *           getIndexForPos(8) => 1
   * @param pos The 0-based position from the right
   */
  private getIndexForPos(pos: number): number {
    return this.buf.length - 1 - Math.floor(Math.abs(pos | 0) / 8)
  }


  /**
   * Get the BIT-based position for a given 0-based position from the RIGHT of
   * the binary number
   * @example buf = 00000000 11111111
   *                       ^
   *          getBitPosForPos(8) => 0
   * @param pos The 0-based position from the RIGHT
   */
  private getBitPosForPos(pos: number): number {
    return Math.abs(pos | 0) % 8
  }

  /**
   * Validate a bit-position. Throws an error if invalid.
   * @param pos The position to check.
   */
  private checkBitPos(pos: number) {
    if (pos < 0 || pos >= this.size) {
      throw new Error(
        `Binary: Bit position "${pos}" is out of range [0, ${this.size - 1}]`
      )
    }
  }

  /**
   * Validate the byte-index. Throws an error if invalid.
   * @param index The index to check.
   */
  private checkByteIndex(index: number) {
    if (index < 0 || index >= this.buf.length) {
      throw new Error(
        `Binary: Byte index "${index}" is out of range [0, ${this.buf.length - 1}]`
      )
    }
  }

  /**
   * Validate the give bit-range. Throws an error if invalid.
   * @param start The start of the range (inclusive)
   * @param end   The end of the range (inclusive)
   */
  private checkBitRange(start: number, end: number) {
    if (start >= end) {
      throw new Error(
        `Binary: Invalid bit-range [${start}, ${end}]: start must be below end`
      )
    }

    if (start < 0 || start >= this.size || end < 0 || end >= this.size) {
      throw new Error(
        `Binary: Bit range "[${start}, ${end}]" must be within [0, ${this.size - 1}]`
      )
    }
  }

  /**
   * Set the bit (0-based) from the RIGHT of the binary number.
   * @example  buf = 00000000
   *           setBit(0, 1) => 00000001
   *           setBit(3, 1) => 00001001
   * @param pos The 0-based position from the RIGHT
   * @param value The binary value to set the bit at the position
   */
  public setBit(pos: number, value: number) {
    this.checkBitPos(pos)

    // only concerned with first bit of value
    const bitValue = value & 1
    const index = this.getIndexForPos(pos)
    const bitPos = this.getBitPosForPos(pos)
    const mask = 1 << bitPos

    if (bitValue) {
      // set bit at pos to 1
      this.buf[index] |= mask
    } else {
      // set bit at pos to 0
      this.buf[index] &= ~mask
    }
  }

  /**
   * Get the bit for the given 0-based position from the RIGHT
   * @example  buf = 00001000 11001010
   *                     ^
   *           getBit(11) => 1
   * @param pos The 0-based position from the RIGHT
   */
  public getBit(pos: number): number {
    this.checkBitPos(pos)

    const index = this.getIndexForPos(pos)
    const bitPos = this.getBitPosForPos(pos)
    const value = (this.buf[index] & (1 << bitPos)) >>> bitPos

    return value
  }

  /**
   * Set the byte of the given binary number, 0-based from the RIGHT.
   * @example  buf = 00000000 00000000
   *           setByte(0, 42) =>
   *                 00000000 00101010
   * @param index The 0-based byte position from the RIGHT
   * @param value The value of the byte
   */
  public setByte(index: number, value: number) {
    this.checkByteIndex(index)

    this.buf[this.buf.length - 1 - index] = value
  }

  /**
   * Get the byte of the given 0-based index from the RIGHT.
   * @example  buf = 00101010 00000000
   *           getByte(1) => 42
   * @param index The 0-based index from the RIGHT
   */
  public getByte(index: number): number {
    this.checkByteIndex(index)

    return this.buf[this.buf.length - 1 - index]
  }

  /**
   * Get the cumulative value of the bit-range (0-based, from the RIGHT).
   * @example  buf = 00010001 00000001
   *                        ^        ^
   *           getRange(0, 8) => 257
   * @param start The 0-based position from the RIGHT
   * @param end   The 0-based position from the RIGHT
   */
  public getRange(start: number, end: number): number {
    this.checkBitRange(start, end)

    start = Math.abs(start | 0)
    end = Math.abs(end | 0)
    let ret = 0

    for (let i = start; i <= end; i++) {
      ret += this.getBit(i) * Math.pow(2, i - start)
    }

    return ret
  }

  /**
   * Get the value of the total binary number.
   */
  public getValue(): number {
    return this.getRange(0, this.size - 1)
  }

  /**
   * Override `valueOf`
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/valueOf
   */
  public valueOf(): number {
    return this.getValue()
  }

  /**
   * Override `toString`. Returns a string representation of the binary number
   * in the given radix.
   */
  public toString(radix: number = 2): string {
    if (radix < 2 || radix > 36) {
      throw new Error(`Binary: Radix must be in range [2, 36]`)
    }

    return this.getValue().toString(radix)
  }

  public toUint8Array() {
    const clone = new Uint8Array(this.size / 8)

    for (let i = 0; i < this.buf.length; i++) {
      clone[i] = this.buf[i]
    }

    return clone
  }

  public toUint32Array() {
    const size32 = this.size / 32
    const clone = new Uint32Array(size32)

    // TODO: Fix this
    for (let i = 0; i < size32; i++) {
      clone[i] =
        this.buf[i + 0] |
        this.buf[i + 1] |
        this.buf[i + 2] |
        this.buf[i + 3]
    }

    return clone
  }

  static fromUint8Array(arr: Uint8Array): Binary {
    const binary = new Binary(arr.length * 8)

    for (let i = 0; i < arr.length; i++) {
      binary.setByte(i, arr[i])
    }

    return binary
  }

  static fromUint32Array(arr: Uint32Array): Binary {
    const binary = new Binary(arr.length * 32)

    for (let i = 0; i < arr.length; i++) {
      binary.setByte(i + 0, (arr[i] & 0xff000000) >>> 24)
      binary.setByte(i + 1, (arr[i] & 0x00ff0000) >>> 16)
      binary.setByte(i + 2, (arr[i] & 0x0000ff00) >>> 8)
      binary.setByte(i + 3, (arr[i] & 0x000000ff))
    }

    return binary
  }

  static fromArray(arr: number[]): Binary {
    const binary = new Binary(arr.length)

    for (let i = arr.length - 1, j = 0; i >= 0; i--, j++) {
      binary.setBit(j, arr[i])
    }

    return binary
  }

  /**
   * Helper to return a Binary instance from a given POSITIVE number.
   * @param num Positive number
   */
  static fromNumber(num: number): Binary {
    num = Math.abs(Math.floor(num))
    const size = Math.floor(Math.log(num) / Math.log(2)) + 1
    const binary = new Binary(size)

    let i = 0
    while (num) {
      const byte = num % 256
      binary.setByte(i, byte)
      num = Math.floor(num / 256)
      i++
    }

    return binary
  }
}