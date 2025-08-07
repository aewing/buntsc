import { watch } from '../../src/watch';
import type { WatchOptions } from '../../src/watch';

export class WatchCommand {
  constructor(private options: WatchOptions) {}

  async run(): Promise<void> {
    await watch(this.options);
  }
}