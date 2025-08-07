import { Glob } from 'bun';

const testPattern = 'src/**/*.ts';
const glob = new Glob(testPattern);

console.log('Testing glob pattern:', testPattern);
console.log('Current directory:', process.cwd());

const files: string[] = [];
for await (const file of glob.scan({ cwd: process.cwd() })) {
  files.push(file);
}

console.log('Found files:', files);

// Also test with src/*.ts
const glob2 = new Glob('src/*.ts');
const files2: string[] = [];
for await (const file of glob2.scan({ cwd: process.cwd() })) {
  files2.push(file);
}
console.log('With src/*.ts:', files2);