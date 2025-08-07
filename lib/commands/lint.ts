import { Glob } from 'bun';
import balk from 'balk';
import { loadTsConfig } from '../utils/config';
import { measureTime } from '../utils/performance';
import { $ } from 'bun';

export interface LintOptions {
  project: string;
  fix?: boolean;
  format?: 'pretty' | 'json' | 'github';
}

export class LintCommand {
  constructor(private options: LintOptions) {}

  async run(): Promise<void> {
    const startTime = performance.now();
    console.log(balk.blue('🔍 Linting TypeScript files with oxlint...'));

    try {
      const tsConfig = await loadTsConfig(this.options.project);
      const files = await this.getSourceFiles(tsConfig);
      
      if (files.length === 0) {
        console.log(balk.yellow('⚠️  No TypeScript files found to lint'));
        return;
      }

      const oxlintPath = await this.findOxlint();
      if (!oxlintPath) {
        console.error(balk.red('❌ oxlint not found. Please install it with: bun add oxlint'));
        process.exit(1);
      }

      const args: string[] = [];
      
      if (this.options.fix) {
        args.push('--fix');
      }

      if (this.options.format === 'json') {
        args.push('--format', 'json');
      } else if (this.options.format === 'github') {
        args.push('--format', 'github');
      }

      args.push(...files);

      const result = await $`${oxlintPath} ${args}`.quiet();
      
      if (result.exitCode === 0) {
        const elapsed = measureTime(startTime);
        console.log(balk.green(`✅ No linting issues found (${elapsed})`));
      } else {
        const output = result.stdout.toString() || result.stderr.toString();
        if (output) {
          console.log(output);
        }
        
        if (this.options.fix) {
          console.log(balk.yellow('⚠️  Some issues were auto-fixed'));
        } else {
          console.log(balk.yellow('💡 Run with --fix to auto-fix some issues'));
        }
        
        process.exit(1);
      }
    } catch (error: any) {
      if (error.stdout || error.stderr) {
        const output = error.stdout?.toString() || error.stderr?.toString();
        console.log(output);
        
        if (this.options.fix) {
          console.log(balk.yellow('⚠️  Some issues were auto-fixed'));
        } else {
          console.log(balk.yellow('💡 Run with --fix to auto-fix some issues'));
        }
        
        process.exit(1);
      } else {
        console.error(balk.red('❌ Linting failed:'), error);
        process.exit(1);
      }
    }
  }

  private async getSourceFiles(tsConfig: any): Promise<string[]> {
    const include = tsConfig.include || ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'];
    const exclude = tsConfig.exclude || ['node_modules', 'dist', 'build'];
    
    const patterns = Array.isArray(include) ? include : [include];
    const files: string[] = [];

    for (const pattern of patterns) {
      const glob = new Glob(pattern);
      for await (const file of glob.scan({ cwd: process.cwd() })) {
        const shouldExclude = exclude.some((ex: string) => {
          const excludeGlob = new Glob(ex);
          return excludeGlob.match(file);
        });
        if (!shouldExclude) {
          files.push(file);
        }
      }
    }

    return files;
  }

  private async findOxlint(): Promise<string | null> {
    const paths = [
      './node_modules/.bin/oxlint',
      'oxlint',
    ];

    for (const oxlintPath of paths) {
      try {
        const result = await $`${oxlintPath} --version`.quiet();
        if (result.exitCode === 0) {
          return oxlintPath;
        }
      } catch {
        continue;
      }
    }

    return null;
  }
}