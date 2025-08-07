import { test, expect, describe, beforeEach, afterEach } from 'bun:test';
import { typeCheck } from './typecheck';
import { $ } from 'bun';

describe('typeCheck', () => {
  const testDir = './test-typecheck-output';
  
  beforeEach(async () => {
    await $`rm -rf ${testDir}`.quiet();
    await $`mkdir -p ${testDir}/src`.quiet();
  });

  afterEach(async () => {
    await $`rm -rf ${testDir}`.quiet();
  });

  test('should detect syntax errors', async () => {
    await Bun.write(`${testDir}/src/index.ts`, `
      function add(a: number, b: number): number {
        return a + b // Missing semicolon is ok
      }
      
      // This should cause a syntax error
      const result: = "invalid syntax";
    `);
    
    await Bun.write(`${testDir}/tsconfig.json`, JSON.stringify({
      compilerOptions: {
        target: 'ES2022',
        module: 'ESNext',
        strict: true,
        noEmit: true
      },
      include: ['src/**/*.ts']
    }, null, 2));
    
    const originalCwd = process.cwd();
    process.chdir(testDir);
    
    try {
      const result = await typeCheck({
        project: './tsconfig.json',
        noEmit: true
      });
      
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      // oxc-parser will catch the syntax error
    } finally {
      process.chdir(originalCwd);
    }
  });

  test('should pass with no type errors', async () => {
    await Bun.write(`${testDir}/src/index.ts`, `
      function add(a: number, b: number): number {
        return a + b;
      }
      
      const result: number = add(1, 2);
      console.log(result);
    `);
    
    await Bun.write(`${testDir}/tsconfig.json`, JSON.stringify({
      compilerOptions: {
        target: 'ES2022',
        module: 'ESNext',
        strict: true,
        noEmit: true
      },
      include: ['src/**/*.ts']
    }, null, 2));
    
    const originalCwd = process.cwd();
    process.chdir(testDir);
    
    try {
      const result = await typeCheck({
        project: './tsconfig.json',
        noEmit: true
      });
      
      expect(result.success).toBe(true);
      expect(result.errors.length).toBe(0);
    } finally {
      process.chdir(originalCwd);
    }
  });
});