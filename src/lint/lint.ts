import { Glob } from 'bun';
import { $ } from 'bun';
import balk from 'balk';
import { loadTsConfig } from '../config/config';
import { measureTime } from '../performance/performance';
import type { LintOptions, LintResult } from './types';

/**
 * Lint TypeScript files using oxlint for fast, native performance
 */
export async function lint(options: LintOptions): Promise<LintResult> {
  const startTime = performance.now();
  console.log(balk.blue('🔍 Linting TypeScript files with oxlint...'));

  try {
    const tsConfig = await loadTsConfig(options.project);
    const files = await getSourceFiles(tsConfig);
    
    if (files.length === 0) {
      console.log(balk.yellow('⚠️  No TypeScript files found to lint'));
      return {
        success: true,
        errors: [],
        warnings: [],
        duration: performance.now() - startTime
      };
    }

    const oxlintPath = await findOxlint();
    if (!oxlintPath) {
      console.error(balk.red('❌ oxlint not found. Please install it with: bun add oxlint'));
      return {
        success: false,
        errors: [{
          file: '',
          line: 0,
          column: 0,
          rule: 'OXLINT_NOT_FOUND',
          message: 'oxlint not found',
          severity: 'error'
        }],
        warnings: [],
        duration: performance.now() - startTime
      };
    }

    const args: string[] = [];
    
    if (options.fix) {
      args.push('--fix');
    }

    if (options.format === 'json') {
      args.push('--format', 'json');
    } else if (options.format === 'github') {
      args.push('--format', 'github');
    }

    if (options.quiet) {
      args.push('--quiet');
    }

    args.push(...files);

    const result = await $`${oxlintPath} ${args}`.quiet();
    
    if (result.exitCode === 0) {
      const elapsed = measureTime(startTime);
      console.log(balk.green(`✅ No linting issues found (${elapsed})`));
      return {
        success: true,
        errors: [],
        warnings: [],
        duration: performance.now() - startTime
      };
    } else {
      const output = result.stdout.toString() || result.stderr.toString();
      if (output) {
        console.log(output);
      }
      
      if (options.fix) {
        console.log(balk.yellow('⚠️  Some issues were auto-fixed'));
      } else {
        console.log(balk.yellow('💡 Run with --fix to auto-fix some issues'));
      }
      
      return {
        success: false,
        errors: [], // TODO: Parse oxlint output for structured errors
        warnings: [],
        duration: performance.now() - startTime
      };
    }
  } catch (error: any) {
    if (error.stdout || error.stderr) {
      const output = error.stdout?.toString() || error.stderr?.toString();
      console.log(output);
      
      if (options.fix) {
        console.log(balk.yellow('⚠️  Some issues were auto-fixed'));
      } else {
        console.log(balk.yellow('💡 Run with --fix to auto-fix some issues'));
      }
    } else {
      console.error(balk.red('❌ Linting failed:'), error);
    }
    
    return {
      success: false,
      errors: [],
      warnings: [],
      duration: performance.now() - startTime
    };
  }
}

async function getSourceFiles(tsConfig: any): Promise<string[]> {
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

async function findOxlint(): Promise<string | null> {
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