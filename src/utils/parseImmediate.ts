export default function parseImmediate(imm: string): number {
  let m = 1
  let v: number
  if (/^\-/.test(imm)) {
    m = -1
    imm = imm.substr(1)
  }

  if (/^0x/.test(imm)) v = parseInt(imm.substr(2), 16)
  else if (/^0o/.test(imm)) v = parseInt(imm.substr(2), 8)
  else if (/^0b/.test(imm)) v = parseInt(imm.substr(2), 2)
  else v = parseInt(imm, 10)

  return m * v
}