import { Glob } from 'bun';
import balk from 'balk';
import { loadTsConfig } from '../utils/config';
import { measureTime } from '../utils/performance';
import { $ } from 'bun';

export interface TypeCheckOptions {
  project: string;
  noEmit?: boolean;
  watch?: boolean;
}

export class TypeCheckCommand {
  constructor(private options: TypeCheckOptions) {}

  async run(): Promise<void> {
    const startTime = performance.now();
    console.log(balk.blue('🔍 Type checking TypeScript files...'));

    try {
      const tsConfig = await loadTsConfig(this.options.project);
      
      const tscPath = await this.findTsc();
      if (!tscPath) {
        console.error(balk.red('❌ TypeScript not found. Please install it with: bun add -d typescript'));
        process.exit(1);
      }

      const args = [
        '--project', this.options.project,
        '--noEmit',
        '--pretty',
      ];

      if (this.options.watch) {
        args.push('--watch');
        console.log(balk.blue('👀 Watching for changes...'));
      }

      const result = await $`${tscPath} ${args}`.quiet();
      
      if (result.exitCode === 0) {
        const elapsed = measureTime(startTime);
        console.log(balk.green(`✅ No type errors found (${elapsed})`));
      } else {
        const output = result.stderr.toString() || result.stdout.toString();
        if (output) {
          console.error(output);
        }
        console.error(balk.red('❌ Type checking failed'));
        process.exit(1);
      }
    } catch (error: any) {
      if (error.stdout || error.stderr) {
        const output = error.stderr?.toString() || error.stdout?.toString();
        if (output && !output.includes('error TS')) {
          console.log(output);
        } else if (output) {
          console.error(output);
          console.error(balk.red('❌ Type checking failed'));
          process.exit(1);
        }
      } else {
        console.error(balk.red('❌ Type checking failed:'), error);
        process.exit(1);
      }
    }
  }

  private async findTsc(): Promise<string | null> {
    const paths = [
      './node_modules/.bin/tsc',
      './node_modules/typescript/bin/tsc',
      'tsc',
    ];

    for (const tscPath of paths) {
      try {
        const result = await $`${tscPath} --version`.quiet();
        if (result.exitCode === 0) {
          return tscPath;
        }
      } catch {
        continue;
      }
    }

    return null;
  }
}