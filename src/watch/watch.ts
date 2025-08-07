import { Glob } from 'bun';
import { watch as fsWatch } from 'node:fs';
import { join, relative } from 'node:path';
import balk from 'balk';
import { build } from '../build';
import { loadTsConfig } from '../config/config';
import type { WatchOptions } from './types';

/**
 * Watch TypeScript files and rebuild on changes using Bun's native capabilities
 */
export async function watch(options: WatchOptions): Promise<void> {
  console.log(balk.blue('👀 Watching for changes...'));
  
  const tsConfig = await loadTsConfig(options.project);
  const patterns = tsConfig.include || ['src/**/*.ts', 'src/**/*.tsx'];
  
  const cwd = process.cwd();
  const watchDirs = new Set<string>();
  
  // Extract directories to watch from patterns
  for (const pattern of patterns) {
    const baseDir = pattern.split('/**')[0] || '.';
    watchDirs.add(baseDir);
  }
  
  const watchers: Array<ReturnType<typeof fsWatch>> = [];
  let isBuilding = false;
  let pendingBuild = false;
  
  const rebuild = async () => {
    if (isBuilding) {
      pendingBuild = true;
      return;
    }

    isBuilding = true;
    
    try {
      await build({
        project: options.project,
        outdir: options.outdir,
        target: options.target || 'bun',
        minify: options.minify,
        sourcemap: options.sourcemap,
        splitting: options.splitting,
        external: options.external
      });
    } catch (error) {
      console.error(balk.red('❌ Build error:'), error);
    } finally {
      isBuilding = false;
      
      if (pendingBuild) {
        pendingBuild = false;
        await rebuild();
      }
    }
  };
  
  for (const dir of watchDirs) {
    const watcher = fsWatch(join(cwd, dir), { recursive: true }, (eventType, filename) => {
      if (!filename) return;
      
      const relativePath = relative(cwd, join(dir, filename));
      
      // Check if file matches any of our patterns
      const shouldWatch = patterns.some((pattern: string) => {
        const glob = new Glob(pattern);
        return glob.match(relativePath);
      });

      if (!shouldWatch) return;

      if (!options.preserveWatchOutput) {
        console.clear();
      }
      console.log(balk.cyan(`\n📝 File changed: ${relativePath}`));
      rebuild();
    });
    
    watchers.push(watcher);
  }

  // Initial build
  await rebuild();

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log(balk.yellow('\n👋 Stopping watcher...'));
    watchers.forEach(w => w.close());
    process.exit(0);
  });

  // Keep process alive
  await new Promise(() => {});
}