export interface LintOptions {
  project: string;
  fix?: boolean;
  format?: 'pretty' | 'json' | 'github';
  quiet?: boolean;
}

export interface LintResult {
  success: boolean;
  errors: LintError[];
  warnings: LintError[];
  fixesApplied?: number;
  duration?: number;
}

export interface LintError {
  file: string;
  line: number;
  column: number;
  rule: string;
  message: string;
  severity: 'error' | 'warning';
}