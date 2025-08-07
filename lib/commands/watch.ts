import { Glob } from 'bun';
import { watch as fsWatch } from 'node:fs';
import { join, relative } from 'node:path';
import balk from 'balk';
import { BuildCommand, type BuildOptions } from './build';
import { loadTsConfig } from '../utils/config';

export interface WatchOptions extends Omit<BuildOptions, 'watch'> {
  project: string;
}

export class WatchCommand {
  private buildCommand: BuildCommand;
  private isBuilding = false;
  private pendingBuild = false;

  constructor(private options: WatchOptions) {
    this.buildCommand = new BuildCommand(this.options);
  }

  async run(): Promise<void> {
    console.log(balk.blue('👀 Watching for changes...'));
    
    const tsConfig = await loadTsConfig(this.options.project);
    const patterns = tsConfig.include || ['src/**/*.ts', 'src/**/*.tsx'];
    
    const cwd = process.cwd();
    const watchDirs = new Set<string>();
    
    // Extract directories to watch from patterns
    for (const pattern of patterns) {
      const baseDir = pattern.split('/**')[0] || '.';
      watchDirs.add(baseDir);
    }
    
    const watchers: Array<ReturnType<typeof fsWatch>> = [];
    
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

        console.log(balk.cyan(`\n📝 File changed: ${relativePath}`));
        this.rebuild();
      });
      
      watchers.push(watcher);
    }

    await this.rebuild();

    process.on('SIGINT', () => {
      console.log(balk.yellow('\n👋 Stopping watcher...'));
      watchers.forEach(w => w.close());
      process.exit(0);
    });

    await new Promise(() => {});
  }

  private async rebuild(): Promise<void> {
    if (this.isBuilding) {
      this.pendingBuild = true;
      return;
    }

    this.isBuilding = true;
    
    try {
      await this.buildCommand.run();
    } catch (error) {
      console.error(balk.red('❌ Build error:'), error);
    } finally {
      this.isBuilding = false;
      
      if (this.pendingBuild) {
        this.pendingBuild = false;
        await this.rebuild();
      }
    }
  }
}