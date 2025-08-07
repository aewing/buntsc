import type { CompilerOptions, CompilerResult } from './types';
import { build } from '../build';
import { typeCheck } from '../typecheck';
import { generateDeclarations } from '../declarations';
import { watch } from '../watch';

/**
 * Main compile function that mimics tsc behavior
 * Orchestrates type checking, building, and declaration generation
 */
export async function compile(options: CompilerOptions): Promise<CompilerResult> {
  const startTime = performance.now();
  
  // Watch mode
  if (options.watch) {
    return watch(options);
  }
  
  // Build mode (project references)
  if (options.build) {
    // TODO: Implement project references build mode
    throw new Error('--build mode not yet implemented');
  }
  
  // Type check only (--noEmit)
  if (options.noEmit) {
    return typeCheck(options);
  }
  
  // Declaration only mode (--emitDeclarationOnly)
  if (options.emitDeclarationOnly) {
    return generateDeclarations(options);
  }
  
  // Normal compilation mode
  const results: CompilerResult[] = [];
  
  // Always type check first (unless explicitly disabled)
  const typeCheckResult = await typeCheck(options);
  if (!typeCheckResult.success) {
    return typeCheckResult;
  }
  
  // Build JavaScript files
  const buildResult = await build({
    project: options.project || './tsconfig.json',
    outdir: options.outDir || './dist',
    target: options.bunTarget || 'bun',
    minify: options.minify,
    sourcemap: options.sourceMap,
    splitting: options.splitting,
    external: options.external
  });
  
  // Generate declarations if requested
  if (options.declaration) {
    const declResult = await generateDeclarations(options);
    if (!declResult.success) {
      return declResult;
    }
  }
  
  const duration = performance.now() - startTime;
  
  return {
    success: true,
    duration
  };
}