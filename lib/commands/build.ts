import { Glob } from 'bun';
import balk from 'balk';
import { loadTsConfig } from '../utils/config';
import { measureTime } from '../utils/performance';

export interface BuildOptions {
  project: string;
  outdir: string;
  target: 'bun' | 'node' | 'browser';
  minify?: boolean;
  sourcemap?: boolean;
  splitting?: boolean;
  external?: string[];
}

export class BuildCommand {
  constructor(private options: BuildOptions) {}

  async run(): Promise<void> {
    const startTime = performance.now();
    console.log(balk.blue('🔨 Building TypeScript files...'));

    try {
      const tsConfig = await loadTsConfig(this.options.project);
      const files = await this.getSourceFiles(tsConfig);
      
      if (files.length === 0) {
        console.log(balk.yellow('⚠️  No TypeScript files found to build'));
        return;
      }

      console.log(balk.gray(`Found ${files.length} files to build`));

      const buildResult = await Bun.build({
        entrypoints: files,
        outdir: this.options.outdir,
        target: this.options.target,
        minify: this.options.minify || false,
        sourcemap: this.options.sourcemap ? 'external' : 'none',
        splitting: this.options.splitting || false,
        external: this.options.external || [],
        naming: {
          entry: '[dir]/[name].[ext]',
          chunk: '[name]-[hash].[ext]',
          asset: '[name]-[hash].[ext]',
        },
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
      console.log(balk.gray(`Output: ${this.options.outdir}`));

      if (buildResult.outputs.length > 0) {
        console.log(balk.gray('\nGenerated files:'));
        for (const output of buildResult.outputs) {
          const relativePath = output.path.replace(process.cwd() + '/', '');
          const size = await this.getFileSize(output.path);
          console.log(balk.gray(`  • ${relativePath} (${size})`));
        }
      }
    } catch (error) {
      console.error(balk.red('❌ Build failed:'), error);
      process.exit(1);
    }
  }

  private async getSourceFiles(tsConfig: any): Promise<string[]> {
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

  private async getFileSize(filePath: string): Promise<string> {
    const file = Bun.file(filePath);
    const size = file.size;
    
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }
}