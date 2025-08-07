import { build } from '../../src/build';
import type { BuildOptions } from '../../src/build';

export class BuildCommand {
  constructor(private options: BuildOptions) {}

  async run(): Promise<void> {
    await build(this.options);
  }
}