import { generateDeclarations } from '../../src/declarations';
import type { DeclarationOptions } from '../../src/declarations';

export class DeclarationCommand {
  constructor(private options: DeclarationOptions) {}

  async run(): Promise<void> {
    const result = await generateDeclarations(this.options);
    
    if (!result.success) {
      process.exit(1);
    }
  }
}