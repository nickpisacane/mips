export default function invertIndexTable(t: { [key: string]: number }): { [key: number]: string } {
  const ret: { [key: number]: string } = {}
  Object.keys(t).forEach(k => {
    ret[t[k]] = k
  })
  return ret
}