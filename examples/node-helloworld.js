const MIPS = require('../lib').default
const source = `# HelloWorld.mips
  .data
message: .asciiz "Hello, World!"
  .text
main:
  # syscall (4) prints the value of the address of the register $a0
  li $v0, 4
  la $a0, message
  syscall
`

const mips = new MIPS({
  source,
  stdin: process.stdin,
  stdout: process.stdout,
  stderr: process.stderr,
})

const main = async () => {
  mips.assemble()
  await mips.execute()
}

main()
  .catch(err => {
    process.nextTick(() => { throw err })
  })