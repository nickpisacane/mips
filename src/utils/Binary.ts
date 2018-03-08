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
   * Set the bit (0-based) from the RIGHT of the binary number.
   * @example  buf = 00000000
   *           setBit(0, 1) => 00000001
   *           setBit(3, 1) => 00001001
   * @param pos The 0-based position from the RIGHT
   * @param value The binary value to set the bit at the position
   */
  public setBit(pos: number, value: number) {
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
    if (index >= this.buf.length) {
      throw new Error(`Binary: Byte index out of range.`)
    }

    this.buf[this.buf.length - 1 - index] = value
  }

  /**
   * Get the byte of the given 0-based index from the RIGHT.
   * @example  buf = 00101010 00000000
   *           getByte(1) => 42
   * @param index The 0-based index from the RIGHT
   */
  public getByte(index: number): number {
    return this.buf[this.buf.length - 1 - index]
  }

  public getRange(start: number, end: number): number {
    start = Math.abs(start | 0)
    end = Math.abs(end | 0)
    let ret = 0

    for (let i = start; i <= end; i++) {
      ret += this.getBit(i) * Math.pow(2, i - start)
    }

    return ret
  }

  public getValue(): number {
    return this.getRange(0, this.size - 1)
  }

  public valueOf(): number {
    return this.getValue()
  }

  public toString(): string {
    let ret = ''

    for (let i = this.size - 1; i >= 0; i--) {
      ret += this.getBit(i)
    }

    return ret
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
}