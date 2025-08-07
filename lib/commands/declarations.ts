import { $ } from 'bun';
import { Glob } from 'bun';
import balk from 'balk';
import { loadTsConfig } from '../utils/config';
import { measureTime } from '../utils/performance';

export interface DeclarationOptions {
  project: string;
  outdir?: string;
  emitDeclarationOnly?: boolean;
}

export class DeclarationCommand {
  constructor(private options: DeclarationOptions) {}

  async run(): Promise<void> {
    const startTime = performance.now();
    console.log(balk.blue('📝 Generating TypeScript declaration files...'));

    try {
      const tscPath = await this.findTsc();
      if (!tscPath) {
        console.error(balk.red('❌ TypeScript not found. Please install it with: bun add -d typescript'));
        process.exit(1);
      }

      const args = [
        '--project', this.options.project,
        '--declaration',
        '--emitDeclarationOnly',
        '--pretty'
      ];

      if (this.options.outdir) {
        args.push('--outDir', this.options.outdir);
      }

      const result = await $`${tscPath} ${args}`.quiet();
      
      if (result.exitCode === 0) {
        const elapsed = measureTime(startTime);
        console.log(balk.green(`✅ Declaration files generated (${elapsed})`));
        
        if (this.options.outdir) {
          console.log(balk.gray(`Output: ${this.options.outdir}`));
        }
      } else {
        const output = result.stderr.toString() || result.stdout.toString();
        if (output) {
          console.error(output);
        }
        console.error(balk.red('❌ Declaration generation failed'));
        process.exit(1);
      }
    } catch (error: any) {
      if (error.stdout || error.stderr) {
        const output = error.stderr?.toString() || error.stdout?.toString();
        console.error(output);
        console.error(balk.red('❌ Declaration generation failed'));
        process.exit(1);
      } else {
        console.error(balk.red('❌ Declaration generation failed:'), error);
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