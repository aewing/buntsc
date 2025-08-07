import { typeCheck } from '../../src/typecheck';
import type { TypeCheckOptions } from '../../src/typecheck';

/**
 * Thin wrapper for the typecheck command
 * Maps CLI options to the typeCheck function
 */
export class TypeCheckCommand {
  constructor(private options: TypeCheckOptions) {}

  async run(): Promise<void> {
    const result = await typeCheck(this.options);
    
    if (!result.success) {
      process.exit(1);
    }
  }
}