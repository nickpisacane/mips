# mips

### [Online Demo](http://mips.run)

Mips assembler/interpreter in JavaScript (via TypeScript). MIPS is currently a 
work-in-progress, but it has been tested to run most non-floating-point instruction
mips code. See the [Road Map](#road-map) for near-future features.

# Installation
```sh
npm install mips
# or
yarn install mips
```

# Road Map
- [x] Implement fundamental R, I, and J type instructions
- [x] Create basic browser demo app
- [x] Create event (publish-subscribe) API for Memory/Registers
- [ ] Implement floating point instructions / registers
- [ ] Create source mappings in the Assembler chain
- [ ] Better code validation (pre-assemble)
- [ ] Create CLI interface
- [ ] Expand online demo app to use LocalStorage API, show source maps, and show memory/register changes live
