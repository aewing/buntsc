import { Glob } from 'bun';
import balk from 'balk';
import { loadTsConfig } from '../config/config';
import { measureTime } from '../performance/performance';
import type { BuildOptions } from './types';

export async function build(options: BuildOptions): Promise<void> {
  const startTime = performance.now();
  console.log(balk.blue('🔨 Building TypeScript files...'));

  try {
    const tsConfig = await loadTsConfig(options.project);
    const files = await getSourceFiles(tsConfig);
    
    if (files.length === 0) {
      console.log(balk.yellow('⚠️  No TypeScript files found to build'));
      return;
    }

    console.log(balk.gray(`Found ${files.length} files to build`));

    // Calculate root directory for preserving structure
    const rootDir = process.cwd();
    
    const buildResult = await Bun.build({
      entrypoints: files,
      outdir: options.outdir,
      target: options.target,
      minify: options.minify || false,
      sourcemap: options.sourcemap ? 'external' : 'none',
      splitting: options.splitting || false,
      external: options.external || [],
      naming: {
        entry: '[dir]/[name].js',
        chunk: '[name]-[hash].js',
        asset: '[name]-[hash].[ext]',
      },
      root: rootDir,
      loader: {
        '.ts': 'ts',
        '.tsx': 'tsx',
        '.jsx': 'jsx',
        '.js': 'js',
      },
    });

    if (!buildResult.success) {
      console.error(balk.red('❌ Build failed:'));
      for (const log of buildResult.logs) {
        console.error(balk.red(`  ${log}`));
      }
      process.exit(1);
    }

    const elapsed = measureTime(startTime);
    console.log(balk.green(`✅ Build completed in ${elapsed}`));
    console.log(balk.gray(`Output: ${options.outdir}`));

    if (buildResult.outputs.length > 0) {
      console.log(balk.gray('\nGenerated files:'));
      for (const output of buildResult.outputs) {
        const relativePath = output.path.replace(process.cwd() + '/', '');
        const size = await getFileSize(output.path);
        console.log(balk.gray(`  • ${relativePath} (${size})`));
      }
    }
  } catch (error) {
    console.error(balk.red('❌ Build failed:'), error);
    process.exit(1);
  }
}

async function getSourceFiles(tsConfig: any): Promise<string[]> {
  const include = tsConfig.include || ['**/*.ts', '**/*.tsx'];
  const exclude = tsConfig.exclude || ['node_modules', 'dist', '**/*.test.ts', '**/*.spec.ts'];
  
  const patterns = Array.isArray(include) ? include : [include];
  const files: string[] = [];
  
  const cwd = process.cwd();

  for (const pattern of patterns) {
    const glob = new Glob(pattern);
    for await (const file of glob.scan({ cwd, absolute: true })) {
      const relativePath = file.slice(cwd.length + 1);
      let shouldExclude = false;
      
      for (const ex of exclude) {
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

async function getFileSize(filePath: string): Promise<string> {
  const file = Bun.file(filePath);
  const size = file.size;
  
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}