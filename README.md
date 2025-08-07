# buntsc 🚀

A fast TypeScript compiler alternative powered by Bun and OXC. Drop-in replacement for `tsc` with enhanced performance.

[![Version](https://img.shields.io/npm/v/buntsc.svg)](https://www.npmjs.com/package/buntsc)
[![License](https://img.shields.io/npm/l/buntsc.svg)](https://github.com/aewing/buntsc/blob/main/LICENSE)

## Features

- ⚡ **Lightning Fast** - Powered by Bun's native TypeScript transpiler
- 🔍 **Type Checking** - Full TypeScript type checking using the official TypeScript compiler
- 📦 **Smart Bundling** - Intelligent bundling with tree-shaking and code splitting
- 🎨 **Beautiful Output** - Colored terminal output with clear error messages
- 🔄 **Watch Mode** - Automatic rebuilding on file changes
- 📝 **Declaration Files** - Generate `.d.ts` files for your TypeScript projects
- 🧹 **Built-in Linting** - Integrated OXC linter for code quality
- 🎯 **tsc Compatible** - Drop-in replacement with familiar CLI options

## Installation

```bash
# Using Bun
bun add -g buntsc

# Using npm
npm install -g buntsc

# Using yarn
yarn global add buntsc

# Using pnpm
pnpm add -g buntsc
```

## Quick Start

```bash
# Initialize a new project
buntsc init

# Build your TypeScript project (just like tsc)
buntsc

# Type check only (no emit)
buntsc --noEmit

# Watch mode
buntsc --watch

# Generate declaration files only
buntsc --emitDeclarationOnly
```

## Usage

### Basic Commands

```bash
# Build project (default: reads tsconfig.json)
buntsc

# Specify a different config file
buntsc -p ./tsconfig.build.json

# Build with source maps
buntsc --sourceMap

# Output to specific directory
buntsc --outDir ./build

# Watch mode
buntsc -w
```

### Advanced Commands

```bash
# Build command with options
buntsc build --minify --splitting --target node

# Type checking
buntsc typecheck
# or use the alias
buntsc tsc

# Linting with auto-fix
buntsc lint --fix

# Generate declaration files
buntsc declarations
# or use the alias
buntsc dts

# Watch specific directory
buntsc watch -o ./dist
```

## CLI Options

### Main Command Options (tsc-compatible)

| Option | Description | Default |
|--------|-------------|---------|
| `-p, --project <path>` | Path to tsconfig.json | `./tsconfig.json` |
| `-w, --watch` | Watch input files | `false` |
| `--noEmit` | Do not emit outputs | `false` |
| `-o, --outDir <dir>` | Redirect output to directory | `./dist` |
| `--declaration` | Generate .d.ts files | `false` |
| `--emitDeclarationOnly` | Only output .d.ts files | `false` |
| `--sourceMap` | Generate source map files | `false` |
| `--target <target>` | Set JavaScript language version | `ES2022` |

### Build Command Options

```bash
buntsc build [options]
```

| Option | Description | Default |
|--------|-------------|---------|
| `--minify` | Minify output | `false` |
| `--splitting` | Enable code splitting | `false` |
| `--external <packages...>` | External packages | `[]` |
| `--target <target>` | Build target (bun, node, browser) | `bun` |

### Lint Command Options

```bash
buntsc lint [options]
```

| Option | Description | Default |
|--------|-------------|---------|
| `--fix` | Auto fix issues | `false` |
| `--format <format>` | Output format (pretty, json, github) | `pretty` |

## Configuration

### tsconfig.json

buntsc respects your `tsconfig.json` configuration:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "noEmit": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

### buntsc.config.json (optional)

For additional buntsc-specific configuration:

```json
{
  "build": {
    "target": "bun",
    "outdir": "./dist",
    "splitting": false,
    "minify": false,
    "sourcemap": true
  },
  "typecheck": {
    "strict": true
  },
  "lint": {
    "rules": {}
  }
}
```

## Performance

buntsc leverages Bun's native TypeScript transpiler for blazing fast compilation:

- ⚡ **10-100x faster** than traditional TypeScript compilation
- 🔥 Native performance with zero JavaScript overhead
- 📦 Efficient bundling with built-in tree shaking
- 🚀 Parallel processing for large codebases

## Examples

### Building a Node.js Application

```bash
# Compile for Node.js with source maps
buntsc build --target node --sourceMap

# Minified production build
buntsc build --target node --minify --outdir ./dist
```

### Building for the Browser

```bash
# Browser bundle with code splitting
buntsc build --target browser --splitting

# Minified browser bundle
buntsc build --target browser --minify --sourcemap
```

### Library Development

```bash
# Generate types only
buntsc --emitDeclarationOnly

# Build with declarations
buntsc --declaration

# Watch mode with type checking
buntsc --watch --noEmit
```

### CI/CD Integration

```yaml
# GitHub Actions example
- name: Type Check
  run: buntsc --noEmit

- name: Build
  run: buntsc build --minify

- name: Lint
  run: buntsc lint --format github
```

## Migrating from tsc

buntsc is designed as a drop-in replacement for `tsc`. Simply replace `tsc` with `buntsc` in your build scripts:

```json
{
  "scripts": {
    "build": "buntsc",
    "type-check": "buntsc --noEmit",
    "watch": "buntsc --watch",
    "build:prod": "buntsc build --minify"
  }
}
```

## Requirements

- Bun >= 1.0.0
- TypeScript >= 5.0.0 (peer dependency for type checking)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

```bash
# Clone the repository
git clone https://github.com/aewing/buntsc.git

# Install dependencies
bun install

# Run tests
bun test

# Build the project
bun run build
```

## License

MIT © [Andrew Ewing](https://github.com/aewing)

## Acknowledgments

- Built with [Bun](https://bun.sh) - The all-in-one JavaScript runtime
- Linting powered by [OXC](https://oxc-project.github.io/) - The JavaScript Oxidation Compiler
- Type checking by [TypeScript](https://www.typescriptlang.org/) - JavaScript with syntax for types

---

Made with ❤️ using Bun