import { test, expect, describe, beforeEach, afterEach } from 'bun:test';
import { build } from './build';
import { $ } from 'bun';

describe('build', () => {
  const testDir = './test-build-output';
  
  beforeEach(async () => {
    await $`rm -rf ${testDir}`.quiet();
    await $`mkdir -p ${testDir}/src`.quiet();
    await Bun.write(`${testDir}/src/index.ts`, `
      export function hello(name: string): string {
        return \`Hello, \${name}!\`;
      }
      
      export const version = "1.0.0";
    `);
    await Bun.write(`${testDir}/src/utils.ts`, `
      export function capitalize(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1);
      }
    `);
    await Bun.write(`${testDir}/tsconfig.json`, JSON.stringify({
      compilerOptions: {
        target: 'ES2022',
        module: 'ESNext',
        outDir: './dist',
        strict: true,
        skipLibCheck: true
      },
      include: ['src/**/*.ts'],
      exclude: ['node_modules', 'dist']
    }, null, 2));
  });

  afterEach(async () => {
    await $`rm -rf ${testDir}`.quiet();
  });

  test('should build TypeScript files', async () => {
    const originalCwd = process.cwd();
    process.chdir(testDir);
    
    try {
      await build({
        project: './tsconfig.json',
        outdir: './dist',
        target: 'bun'
      });

      const outputFile = Bun.file('./dist/src/index.js');
      expect(await outputFile.exists()).toBe(true);
      
      const content = await outputFile.text();
      expect(content).toContain('hello');
      expect(content).toContain('Hello,');
      expect(content).toContain('version');
      
      const utilsFile = Bun.file('./dist/src/utils.js');
      expect(await utilsFile.exists()).toBe(true);
    } finally {
      process.chdir(originalCwd);
    }
  });

  test('should support minification', async () => {
    const originalCwd = process.cwd();
    process.chdir(testDir);
    
    try {
      await build({
        project: './tsconfig.json',
        outdir: './dist',
        target: 'bun',
        minify: true
      });

      const outputFile = Bun.file('./dist/src/index.js');
      expect(await outputFile.exists()).toBe(true);
      const content = await outputFile.text();
      
      // Check that content is minified (much shorter than original)
      const originalFile = Bun.file(`./src/index.ts`);
      const originalContent = await originalFile.text();
      expect(content.length).toBeLessThan(originalContent.length);
    } finally {
      process.chdir(originalCwd);
    }
  });

  test('should generate source maps when requested', async () => {
    const originalCwd = process.cwd();
    process.chdir(testDir);
    
    try {
      await build({
        project: './tsconfig.json',
        outdir: './dist',
        target: 'bun',
        sourcemap: true
      });

      const mapFile = Bun.file('./dist/src/index.js.map');
      expect(await mapFile.exists()).toBe(true);
      
      const mapContent = await mapFile.text();
      const sourceMap = JSON.parse(mapContent);
      expect(sourceMap.version).toBe(3);
      expect(sourceMap.sources).toContain('../src/index.ts');
    } finally {
      process.chdir(originalCwd);
    }
  });
});