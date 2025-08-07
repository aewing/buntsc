const content = '{"include": ["src/**/*.ts"]}';
const jsonContent = content.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');
console.log('Original:', content);
console.log('Cleaned:', jsonContent);
console.log('Parsed:', JSON.parse(jsonContent));