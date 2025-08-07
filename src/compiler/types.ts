// TypeScript compiler compatible options
export interface CompilerOptions {
  // Input Options
  project?: string;           // -p, --project
  rootDir?: string;          // --rootDir
  
  // Output Options  
  outDir?: string;           // --outDir
  outFile?: string;          // --outFile
  
  // Emit Options
  noEmit?: boolean;          // --noEmit
  declaration?: boolean;      // -d, --declaration
  emitDeclarationOnly?: boolean; // --emitDeclarationOnly
  sourceMap?: boolean;       // --sourceMap
  inlineSourceMap?: boolean; // --inlineSourceMap
  removeComments?: boolean;  // --removeComments
  
  // Module Options
  module?: 'commonjs' | 'es2015' | 'es2020' | 'es2022' | 'esnext' | 'node16' | 'nodenext';
  target?: 'es3' | 'es5' | 'es2015' | 'es2016' | 'es2017' | 'es2018' | 'es2019' | 'es2020' | 'es2021' | 'es2022' | 'esnext';
  moduleResolution?: 'node' | 'bundler' | 'node16' | 'nodenext';
  
  // Strict Checks
  strict?: boolean;          // --strict
  noImplicitAny?: boolean;   // --noImplicitAny
  strictNullChecks?: boolean; // --strictNullChecks
  
  // Watch Options
  watch?: boolean;           // -w, --watch
  preserveWatchOutput?: boolean; // --preserveWatchOutput
  
  // Build Options
  build?: boolean;           // -b, --build
  clean?: boolean;           // --clean
  force?: boolean;           // -f, --force
  
  // Other Options
  listFiles?: boolean;       // --listFiles
  listEmittedFiles?: boolean; // --listEmittedFiles
  pretty?: boolean;          // --pretty
  verbose?: boolean;         // --verbose
  
  // Bun/OXC specific options
  minify?: boolean;          // Minification (Bun)
  splitting?: boolean;       // Code splitting (Bun)
  external?: string[];       // External packages (Bun)
  bunTarget?: 'bun' | 'node' | 'browser'; // Bun-specific target
}

export interface CompilerResult {
  success: boolean;
  diagnostics?: Diagnostic[];
  emittedFiles?: string[];
  duration?: number;
}

export interface Diagnostic {
  file?: string;
  line?: number;
  column?: number;
  code: string | number;
  severity: 'error' | 'warning' | 'info' | 'hint';
  message: string;
}