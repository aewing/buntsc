import { Glob } from 'bun';
import oxc from 'oxc-transform';
import balk from 'balk';
import { loadTsConfig } from '../config/config';
import { measureTime } from '../performance/performance';
import path from 'path';
import type { DeclarationOptions, DeclarationResult, DeclarationError } from './types';

/**
 * Generate TypeScript declaration files using oxc-transform
 * This is much faster than using tsc for declaration generation
 */
export async function generateDeclarations(options: DeclarationOptions): Promise<DeclarationResult> {
  const startTime = performance.now();
  console.log(balk.blue('📝 Generating TypeScript declaration files...'));

  try {
    const tsConfig = await loadTsConfig(options.project);
    const files = await getSourceFiles(tsConfig);
    
    if (files.length === 0) {
      console.log(balk.yellow('⚠️  No TypeScript files found'));
      return {
        success: true,
        files: [],
        errors: [],
        duration: performance.now() - startTime
      };
    }

    const outDir = options.outdir || tsConfig.compilerOptions?.outDir || './dist';
    const rootDir = tsConfig.compilerOptions?.rootDir || '.';
    
    const errors: DeclarationError[] = [];
    const generatedFiles: string[] = [];

    for (const filePath of files) {
      try {
        const file = Bun.file(filePath);
        const sourceCode = await file.text();
        const relativePath = path.relative(process.cwd(), filePath);
        
        // Use oxc-transform to generate declarations
        const result = oxc.isolatedDeclaration(relativePath, sourceCode);
        
        if (result.errors && result.errors.length > 0) {
          for (const error of result.errors) {
            const errorMsg = typeof error === 'string' ? error : 
                            (error.message || JSON.stringify(error));
            errors.push({
              file: relativePath,
              message: errorMsg
            });
            console.error(balk.red(`❌ Error in ${relativePath}: ${errorMsg}`));
          }
          continue;
        }
        
        if (result.code) {
          // Calculate output path
          const relativeFromRoot = path.relative(rootDir, filePath);
          const outputPath = path.join(
            outDir,
            relativeFromRoot.replace(/\.tsx?$/, '.d.ts')
          );
          
          // Ensure directory exists
          const outputDir = path.dirname(outputPath);
          await Bun.$`mkdir -p ${outputDir}`.quiet();
          
          // Write declaration file
          await Bun.write(outputPath, result.code);
          generatedFiles.push(outputPath);
        }
      } catch (error: any) {
        errors.push({
          file: filePath,
          message: error.message || 'Failed to process file'
        });
        console.error(balk.red(`❌ Failed to process ${filePath}:`), error.message);
      }
    }

    const elapsed = measureTime(startTime);
    
    if (errors.length === 0) {
      console.log(balk.green(`✅ Generated ${generatedFiles.length} declaration files (${elapsed})`));
      if (options.outdir) {
        console.log(balk.gray(`Output: ${options.outdir}`));
      }
    } else {
      console.log(balk.yellow(`⚠️  Generated ${generatedFiles.length} files with ${errors.length} errors (${elapsed})`));
    }

    return {
      success: errors.length === 0,
      files: generatedFiles,
      errors,
      duration: performance.now() - startTime
    };
  } catch (error: any) {
    console.error(balk.red('❌ Declaration generation failed:'), error.message);
    return {
      success: false,
      files: [],
      errors: [{
        file: '',
        message: error.message || 'Unknown error'
      }],
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