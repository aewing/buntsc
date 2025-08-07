# Build Module

Fast TypeScript compilation using Bun's native build API.

## Usage

```typescript
import { build } from './build';

await build({
  project: './tsconfig.json',
  outdir: './dist',
  target: 'bun',
  minify: true,
  sourcemap: true
});
```

## Features

- ⚡ Native Bun compilation for maximum speed
- 📦 Supports bundling with tree-shaking
- 🎯 Multiple targets: bun, node, browser
- 🗺️ Source map generation
- 🔄 Code splitting support
- 📊 File size reporting

## Options

- `project`: Path to tsconfig.json
- `outdir`: Output directory for compiled files
- `target`: Build target (bun | node | browser)
- `minify`: Enable minification (optional)
- `sourcemap`: Generate source maps (optional)
- `splitting`: Enable code splitting (optional)
- `external`: List of external packages (optional)