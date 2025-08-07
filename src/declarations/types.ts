export interface DeclarationOptions {
  project: string;
  outdir?: string;
  emitDeclarationOnly?: boolean;
}

export interface DeclarationResult {
  success: boolean;
  files: string[];
  errors: DeclarationError[];
  duration?: number;
}

export interface DeclarationError {
  file: string;
  message: string;
}