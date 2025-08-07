import { watch } from 'bun';
import { Glob } from 'bun';
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
    
    const watcher = watch(process.cwd(), {
      async onChange(path) {
        const shouldWatch = patterns.some((pattern: string) => {
          const glob = new Glob(pattern);
          return glob.match(path);
        });

        if (!shouldWatch) return;

        console.log(balk.cyan(`\n📝 File changed: ${path}`));
        await this.rebuild();
      }
    });

    await this.rebuild();

    process.on('SIGINT', () => {
      console.log(balk.yellow('\n👋 Stopping watcher...'));
      watcher.close();
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