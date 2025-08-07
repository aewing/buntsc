import { lint } from '../../src/lint';
import type { LintOptions } from '../../src/lint';

export class LintCommand {
  constructor(private options: LintOptions) {}

  async run(): Promise<void> {
    const result = await lint(this.options);
    
    if (!result.success) {
      process.exit(1);
    }
  }
}