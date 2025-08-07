// Main compiler module that orchestrates all tsc-compatible operations
export { compile } from './compile';
export { typeCheck } from './typecheck';
export { generateDeclarations } from './declarations';
export { watch } from './watch';
export type { CompilerOptions, CompilerResult } from './types';