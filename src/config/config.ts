import path from 'path';

export async function loadTsConfig(configPath: string): Promise<any> {
  try {
    const absolutePath = path.resolve(configPath);
    const file = Bun.file(absolutePath);
    const content = await file.text();
    
    // Remove comments but be careful with strings
    let result = '';
    let inString = false;
    let inSingleLineComment = false;
    let inMultiLineComment = false;
    let escapeNext = false;
    
    for (let i = 0; i < content.length; i++) {
      const char = content[i];
      const nextChar = content[i + 1];
      
      if (escapeNext) {
        result += char;
        escapeNext = false;
        continue;
      }
      
      if (char === '\\' && inString) {
        result += char;
        escapeNext = true;
        continue;
      }
      
      if (inSingleLineComment) {
        if (char === '\n') {
          inSingleLineComment = false;
          result += char;
        }
        continue;
      }
      
      if (inMultiLineComment) {
        if (char === '*' && nextChar === '/') {
          inMultiLineComment = false;
          i++; // Skip the '/'
        }
        continue;
      }
      
      if (!inString) {
        if (char === '/' && nextChar === '/') {
          inSingleLineComment = true;
          i++; // Skip the second '/'
          continue;
        }
        if (char === '/' && nextChar === '*') {
          inMultiLineComment = true;
          i++; // Skip the '*'
          continue;
        }
      }
      
      if (char === '"' && !inString) {
        inString = true;
      } else if (char === '"' && inString) {
        inString = false;
      }
      
      result += char;
    }
    
    // Remove trailing commas
    result = result.replace(/,(\s*[}\]])/g, '$1');
    
    return JSON.parse(result);
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