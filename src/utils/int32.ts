// Any bitwise op converts to "32 bit int" subsequently converted back, but
// should suffice
export const signed = (n: number) => n | 0

// @see: https://stackoverflow.com/questions/1908492/unsigned-integer-in-javascript
export const unsigned = (n: number) => n >>> 0