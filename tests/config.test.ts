import { test, expect, describe, beforeEach, afterEach } from 'bun:test';
import { loadTsConfig, loadBuntscConfig } from '../lib/utils/config';
import { $ } from 'bun';

describe('Config utilities', () => {
  const testDir = './test-config-dir';
  
  beforeEach(async () => {
    await $`rm -rf ${testDir}`.quiet();
    await $`mkdir -p ${testDir}`.quiet();
  });

  afterEach(async () => {
    await $`rm -rf ${testDir}`.quiet();
  });

  describe('loadTsConfig', () => {
    test('should load tsconfig.json', async () => {
      const tsconfig = {
        compilerOptions: {
          target: 'ES2022',
          module: 'ESNext',
          strict: true
        },
        include: ['src/**/*.ts'],
        exclude: ['node_modules']
      };
      
      await Bun.write(`${testDir}/tsconfig.json`, JSON.stringify(tsconfig, null, 2));
      
      const loaded = await loadTsConfig(`${testDir}/tsconfig.json`);
      expect(loaded.compilerOptions.target).toBe('ES2022');
      expect(loaded.compilerOptions.strict).toBe(true);
      expect(loaded.include).toEqual(['src/**/*.ts']);
    });

    test('should handle tsconfig with comments', async () => {
      const tsconfigWithComments = `{
        // This is a comment
        "compilerOptions": {
          "target": "ES2022", // Another comment
          /* Multi-line
             comment */
          "strict": true
        }
      }`;
      
      await Bun.write(`${testDir}/tsconfig.json`, tsconfigWithComments);
      
      const loaded = await loadTsConfig(`${testDir}/tsconfig.json`);
      expect(loaded.compilerOptions.target).toBe('ES2022');
      expect(loaded.compilerOptions.strict).toBe(true);
    });

    test('should return defaults when file not found', async () => {
      const loaded = await loadTsConfig(`${testDir}/nonexistent.json`);
      expect(loaded.compilerOptions.target).toBe('ES2022');
      expect(loaded.compilerOptions.module).toBe('ESNext');
      expect(loaded.include).toContain('src/**/*');
    });
  });

  describe('loadBuntscConfig', () => {
    test('should load buntsc.config.json', async () => {
      const config = {
        build: {
          target: 'node',
          outdir: './build',
          minify: true
        },
        typecheck: {
          strict: false
        }
      };
      
      await Bun.write(`${testDir}/buntsc.config.json`, JSON.stringify(config, null, 2));
      
      const originalDir = process.cwd();
      process.chdir(testDir);
      try {
        const loaded = await loadBuntscConfig();
        expect(loaded.build.target).toBe('node');
        expect(loaded.build.minify).toBe(true);
        expect(loaded.typecheck.strict).toBe(false);
      } finally {
        process.chdir(originalDir);
      }
    });

    test('should load buntsc.config.ts', async () => {
      const configTs = `
        export default {
          build: {
            target: 'browser',
            outdir: './public',
            splitting: true
          },
          lint: {
            rules: {
              'no-console': 'error'
            }
          }
        };
      `;
      
      await Bun.write(`${testDir}/buntsc.config.ts`, configTs);
      
      const originalDir = process.cwd();
      process.chdir(testDir);
      try {
        const loaded = await loadBuntscConfig();
        expect(loaded.build.target).toBe('browser');
        expect(loaded.build.splitting).toBe(true);
        expect(loaded.lint.rules['no-console']).toBe('error');
      } finally {
        process.chdir(originalDir);
      }
    });

    test('should return defaults when no config found', async () => {
      const originalDir = process.cwd();
      process.chdir(testDir);
      try {
        const loaded = await loadBuntscConfig();
        expect(loaded.build.target).toBe('bun');
        expect(loaded.build.outdir).toBe('./dist');
        expect(loaded.typecheck.strict).toBe(true);
      } finally {
        process.chdir(originalDir);
      }
    });
  });
});