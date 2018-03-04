// Masks
export const RS_MASK   = 0x03e00000
export const OP_MASK   = 0xfc000000
export const RT_MASK   = 0x001f0000
export const RD_MASK   = 0x0000f800
export const SH_MASK   = 0x000007c0
export const FUNC_MASK = 0x0000003f
export const IMM_MASK  = 0x0000ffff
export const ADDR_MASK = 0x03ffffff

// Shifts
export const OP_SHIFT   = 26
export const RS_SHIFT   = OP_SHIFT - 5
export const RT_SHIFT   = RS_SHIFT - 5
export const RD_SHIFT   = RT_SHIFT - 5
export const SH_SHIFT   = RD_SHIFT - 5
export const FUNC_SHIFT = SH_SHIFT - 6
export const IMM_SHIFT  = RT_SHIFT - 16
export const ADDR_SHIFT = OP_SHIFT - 26

// Floating-point masks
export const FMT_MASK = 0x03e00000
export const FT_MASK  = 0x001f0000
export const FS_MASK  = 0x0000f800
export const FD_MASK  = 0x000007c0

// Floating-point shifts
export const FMT_SHIFT = OP_SHIFT  - 5
export const FT_SHIFT  = FMT_SHIFT - 5
export const FS_SHIFT  = FT_SHIFT  - 5
export const FD_SHIFT  = FS_SHIFT  - 5
