import path from 'path';

export async function loadTsConfig(configPath: string): Promise<any> {
  try {
    const absolutePath = path.resolve(configPath);
    const file = Bun.file(absolutePath);
    const content = await file.text();
    
    const jsonContent = content
      .split('\n')
      .map(line => {
        const commentIndex = line.indexOf('//');
        if (commentIndex === -1) return line;
        
        let inString = false;
        let escapeNext = false;
        
        for (let i = 0; i < commentIndex; i++) {
          if (escapeNext) {
            escapeNext = false;
            continue;
          }
          if (line[i] === '\\') {
            escapeNext = true;
            continue;
          }
          if (line[i] === '"') {
            inString = !inString;
          }
        }
        
        if (!inString) {
          return line.substring(0, commentIndex);
        }
        return line;
      })
      .join('\n')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/,(\s*[}\]])/g, '$1');
    
    return JSON.parse(jsonContent);
  } catch (error) {
    console.warn(`Warning: Could not load tsconfig from ${configPath}, using defaults`);
    return {
      compilerOptions: {
        target: 'ES2022',
        module: 'ESNext',
        lib: ['ES2022'],
        moduleResolution: 'bundler',
        strict: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
        esModuleInterop: true,
        resolveJsonModule: true,
        allowJs: true,
      },
      include: ['src/**/*', '**/*.ts', '**/*.tsx'],
      exclude: ['node_modules', 'dist', '**/*.test.ts', '**/*.spec.ts']
    };
  }
}

export async function loadBuntscConfig(configPath?: string): Promise<any> {
  const configPaths = [
    configPath,
    './buntsc.config.json',
    './buntsc.config.ts',
    './.buntscrc',
  ].filter(Boolean);

  for (const configPath of configPaths) {
    if (!configPath) continue;
    try {
      const absolutePath = configPath.startsWith('/') ? configPath : `${process.cwd()}/${configPath}`;
      const file = Bun.file(absolutePath);
      if (await file.exists()) {
        if (configPath.endsWith('.ts')) {
          const module = await import(absolutePath);
          return module.default || module;
        } else {
          const content = await file.text();
          return JSON.parse(content);
        }
      }
    } catch (error) {
      continue;
    }
  }

  return {
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
}