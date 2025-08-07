import { parseSync } from 'oxc-parser';
import { Glob } from 'bun';
import balk from 'balk';
import { loadTsConfig } from '../config/config';
import { measureTime } from '../performance/performance';
import type { TypeCheckOptions, TypeCheckResult, TypeCheckError } from './types';

/**
 * Type check TypeScript files using oxc-parser for semantic analysis
 * This provides fast type checking without requiring the TypeScript compiler
 */
export async function typeCheck(options: TypeCheckOptions): Promise<TypeCheckResult> {
  const startTime = performance.now();
  console.log(balk.blue('🔍 Type checking TypeScript files...'));

  try {
    const tsConfig = await loadTsConfig(options.project);
    const files = await getSourceFiles(tsConfig);
    
    if (files.length === 0) {
      console.log(balk.yellow('⚠️  No TypeScript files found to check'));
      return {
        success: true,
        errors: [],
        warnings: [],
        duration: performance.now() - startTime
      };
    }

    const allErrors: TypeCheckError[] = [];
    const allWarnings: TypeCheckError[] = [];

    for (const filePath of files) {
      const file = Bun.file(filePath);
      const sourceCode = await file.text();
      
      try {
        // Use oxc-parser to parse and check for semantic errors
        const result = parseSync(filePath, sourceCode, {
          sourceType: 'module',
          typescript: true
        });
        
        if (result.errors && result.errors.length > 0) {
          for (const error of result.errors) {
            // Extract error details from OXC error format
            const errorDetail: TypeCheckError = {
              file: filePath,
              line: error.line || 1,
              column: error.column || 1,
              code: error.code || 'OXC001',
              message: typeof error === 'string' ? error : (error.message || JSON.stringify(error)),
              severity: error.severity === 'warning' ? 'warning' : 'error'
            };
            
            if (errorDetail.severity === 'error') {
              allErrors.push(errorDetail);
              console.error(balk.red(`${filePath}:${errorDetail.line}:${errorDetail.column} - error ${errorDetail.code}: ${errorDetail.message}`));
            } else {
              allWarnings.push(errorDetail);
              console.warn(balk.yellow(`${filePath}:${errorDetail.line}:${errorDetail.column} - warning ${errorDetail.code}: ${errorDetail.message}`));
            }
          }
        }
      } catch (parseError: any) {
        // Handle parse errors
        allErrors.push({
          file: filePath,
          line: 1,
          column: 1,
          code: 'PARSE_ERROR',
          message: parseError.message || 'Failed to parse file',
          severity: 'error'
        });
        console.error(balk.red(`${filePath} - Parse error: ${parseError.message}`));
      }
    }

    const elapsed = measureTime(startTime);
    
    if (allErrors.length === 0) {
      console.log(balk.green(`✅ No type errors found (${elapsed})`));
      if (allWarnings.length > 0) {
        console.log(balk.yellow(`⚠️  ${allWarnings.length} warning(s) found`));
      }
    } else {
      console.error(balk.red(`❌ Found ${allErrors.length} error(s)`));
    }

    return {
      success: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings,
      duration: performance.now() - startTime
    };
  } catch (error: any) {
    console.error(balk.red('❌ Type checking failed:'), error.message || error);
    
    return {
      success: false,
      errors: [{
        file: '',
        line: 0,
        column: 0,
        code: 'TYPECHECK_ERROR',
        message: error.message || 'Unknown error',
        severity: 'error'
      }],
      warnings: [],
      duration: performance.now() - startTime
    };
  }
}

async function getSourceFiles(tsConfig: any): Promise<string[]> {
  const include = tsConfig.include || ['**/*.ts', '**/*.tsx'];
  const exclude = tsConfig.exclude || ['node_modules', 'dist', '**/*.test.ts', '**/*.spec.ts', '**/*.d.ts'];
  
  const patterns = Array.isArray(include) ? include : [include];
  const files: string[] = [];
  
  const cwd = process.cwd();

  for (const pattern of patterns) {
    const glob = new Glob(pattern);
    for await (const file of glob.scan({ cwd, absolute: true })) {
      const relativePath = file.slice(cwd.length + 1);
      let shouldExclude = false;
      
      // Skip declaration files
      if (file.endsWith('.d.ts')) {
        shouldExclude = true;
      }
      
      for (const ex of exclude) {
        if (shouldExclude) break;
        
        if (ex.includes('*')) {
          const excludeGlob = new Glob(ex);
          if (excludeGlob.match(relativePath)) {
            shouldExclude = true;
            break;
          }
        } else if (relativePath.startsWith(ex + '/') || relativePath === ex) {
          shouldExclude = true;
          break;
        }
      }
      
      if (!shouldExclude) {
        files.push(file);
      }
    }
  }

  return files;
}