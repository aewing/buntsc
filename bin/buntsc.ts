#!/usr/bin/env bun

import { Command } from 'commander';
import balk from 'balk';
import { BuildCommand } from '../lib/commands/build';
import { TypeCheckCommand } from '../lib/commands/typecheck';
import { LintCommand } from '../lib/commands/lint';
import { WatchCommand } from '../lib/commands/watch';
import { DeclarationCommand } from '../lib/commands/declarations';
import { version } from '../package.json';

const program = new Command();

program
  .name('buntsc')
  .description('TypeScript compiler alternative powered by Bun and OXC')
  .version(version);

program
  .command('build')
  .description('Build TypeScript files')
  .option('-p, --project <path>', 'Path to tsconfig.json', './tsconfig.json')
  .option('-o, --outdir <dir>', 'Output directory', './dist')
  .option('--target <target>', 'Build target (bun, node, browser)', 'bun')
  .option('--minify', 'Minify output')
  .option('--sourcemap', 'Generate source maps')
  .option('--splitting', 'Enable code splitting')
  .option('--external <packages...>', 'External packages')
  .action(async (options) => {
    const buildCommand = new BuildCommand(options);
    await buildCommand.run();
  });

program
  .command('typecheck')
  .alias('tsc')
  .description('Type check TypeScript files')
  .option('-p, --project <path>', 'Path to tsconfig.json', './tsconfig.json')
  .option('--noEmit', 'Do not emit outputs', true)
  .option('--watch', 'Watch mode')
  .action(async (options) => {
    const typeCheckCommand = new TypeCheckCommand(options);
    await typeCheckCommand.run();
  });

program
  .command('lint')
  .description('Lint TypeScript files with oxlint')
  .option('-p, --project <path>', 'Path to tsconfig.json', './tsconfig.json')
  .option('--fix', 'Auto fix issues')
  .option('--format <format>', 'Output format (pretty, json, github)', 'pretty')
  .action(async (options) => {
    const lintCommand = new LintCommand(options);
    await lintCommand.run();
  });

program
  .command('watch')
  .description('Watch and rebuild on changes')
  .option('-p, --project <path>', 'Path to tsconfig.json', './tsconfig.json')
  .option('-o, --outdir <dir>', 'Output directory', './dist')
  .option('--target <target>', 'Build target (bun, node, browser)', 'bun')
  .action(async (options) => {
    const watchCommand = new WatchCommand(options);
    await watchCommand.run();
  });

program
  .command('declarations')
  .alias('dts')
  .description('Generate TypeScript declaration files')
  .option('-p, --project <path>', 'Path to tsconfig.json', './tsconfig.json')
  .option('-o, --outdir <dir>', 'Output directory for declaration files')
  .action(async (options) => {
    const declarationCommand = new DeclarationCommand(options);
    await declarationCommand.run();
  });

program
  .command('init')
  .description('Initialize a new buntsc project')
  .action(async () => {
    console.log(balk.blue('🚀 Initializing new buntsc project...'));
    
    const tsconfig = {
      compilerOptions: {
        target: 'ES2022',
        module: 'ESNext',
        lib: ['ES2022'],
        jsx: 'react-jsx',
        moduleResolution: 'bundler',
        allowImportingTsExtensions: true,
        strict: true,
        noEmit: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
        esModuleInterop: true,
        resolveJsonModule: true,
        allowJs: true,
        types: ['bun-types']
      },
      include: ['src/**/*'],
      exclude: ['node_modules', 'dist']
    };
    
    await Bun.write('./tsconfig.json', JSON.stringify(tsconfig, null, 2));
    console.log(balk.green('✅ Created tsconfig.json'));
    
    const bscConfig = {
      build: {
        target: 'bun',
        outdir: './dist',
        splitting: false,
        minify: false,
        sourcemap: true
      },
      typecheck: {
        strict: true
      },
      lint: {
        rules: {}
      }
    };
    
    await Bun.write('./buntsc.config.json', JSON.stringify(bscConfig, null, 2));
    console.log(balk.green('✅ Created buntsc.config.json'));
    console.log(balk.blue('\n🎉 buntsc project initialized successfully!'));
  });

program.parse();