const source = `
.data
prompt: .asciiz "Enter a number: "
orig: .asciiz "The array in original order:\n"
rev: .asciiz "\nThe array in swaped order:\n"
array: .word 0,0,0,0,0
endl: .asciiz "\n"
    .text
main:
    li $s0, 5 # size
    la $s1, array

    add $a0, $s0, $0
   	la $a1, array
    jal fillArray

    li $v0, 4
    la $a0, orig
    syscall

    add $a0, $s0, $0
    la $a1, array
    jal printArray

    add $a0, $s0, $0
    la $a1, array
    jal sortArray

    li $v0, 4
    la $a0, rev
    syscall

    add $a0, $s0, $0
    la $a1, array
    jal printArray

    li $v0, 10
    syscall

# void printArray(size, *array)
printArray:
    add $t0, $a0, $0
    add $t1, $a1, $0
printArrayLoop:
    beq $t0, $0, printArrayReturn

    li $v0, 1
    lw $a0, 0($t1)
    syscall

    li $v0, 4
    la $a0, endl
    syscall

    addi $t0, $t0, -1
    addi $t1, $t1, 4

    j printArrayLoop
printArrayReturn:
    jr $ra
# END

# void fillArray(size, *array)
fillArray:
    add $t0, $a0, $0 # size
    add $t1, $a1, $0 # *array
fillArrayLoop:
    beq $t0, $0, fillArrayReturn
    li $v0, 4
    la $a0, prompt
    syscall
    li $v0, 5
    syscall

    sw $v0, 0($t1)
    addi $t0, $t0, -1
    addi $t1, $t1, 4

    j fillArrayLoop
fillArrayReturn:
    jr $ra
# END

# void soryArray(size, *array)
sortArray:
    add $t0, $a0, $0 # size
    add $t1, $a1, $0 # *array
    li $t3, 1 # didSwap

    addi $sp, $sp, -4
    sw $ra, 0($sp)
sortArrayMainLoop:
    beq $t3, $0, sortArrayReturn
    jal innerBubble
    add $t3, $v0, $0

    j sortArrayMainLoop
sortArrayReturn:
    lw $ra, 0($sp)
    addi $sp, $sp, 4
    jr $ra

    # bool innerBuble()
    innerBubble:
        li $t4, 1 # iterator
        add $t5, $t1, $0
        li $t8, 0 # innerBubbleDidSwap
    innerBubbleLoop:
        beq $t4, $t0, innerBubbleReturn

        lw $t6, 0($t5)
        lw $t7, 4($t5)

        blt $t7, $t6, innerBubbleSwap
    innerBubbleEndLoop:
        addi $t4, $t4, 1
        addi $t5, $t5, 4

        j innerBubbleLoop
    innerBubbleSwap:
        li $t8, 1 # didSwap = true
        sw $t7, 0($t5)
        sw $t6, 4($t5)

        j innerBubbleEndLoop
    innerBubbleReturn:
        add $v0, $t8, $0
        jr $ra
    # END innerBubble()

# END sortArray()
`
// const MIPS = require('mips')
const MIPS = require('../lib').default

const mips = new MIPS({
  stdin: process.stdin,
  stdout: process.stdout,
  stderr: process.stderr,
  source,
})

const main = async () => {
	mips.assemble()
  await mips.execute()
}

main()
  .catch(err => {
    process.nextTick(() => { throw err })
  })