#!/usr/bin/env bun

import { $ } from 'bun';

// Clean up any leftover test directories
await $`rm -rf test-build-output test-config-dir test-regex.ts debug-glob.ts`.quiet();

// Run the tests
console.log('Running buntsc tests...\n');
const result = await $`bun test`.quiet();

if (result.exitCode === 0) {
  console.log('✅ All tests passed!');
  console.log(result.stdout.toString());
} else {
  console.log('❌ Some tests failed:');
  console.log(result.stdout.toString());
  console.log(result.stderr.toString());
  process.exit(1);
}