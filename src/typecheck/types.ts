export interface TypeCheckOptions {
  project: string;
  noEmit?: boolean;
  watch?: boolean;
  pretty?: boolean;
  incremental?: boolean;
  composite?: boolean;
  assumeChangesOnlyAffectDirectDependencies?: boolean;
}

export interface TypeCheckResult {
  success: boolean;
  errors: TypeCheckError[];
  warnings: TypeCheckError[];
  duration?: number;
}

export interface TypeCheckError {
  file: string;
  line: number;
  column: number;
  code: string;
  message: string;
  severity: 'error' | 'warning';
}