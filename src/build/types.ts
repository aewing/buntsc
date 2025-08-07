export interface BuildOptions {
  project: string;
  outdir: string;
  target: 'bun' | 'node' | 'browser';
  minify?: boolean;
  sourcemap?: boolean;
  splitting?: boolean;
  external?: string[];
}

export interface BuildResult {
  success: boolean;
  outputs: Array<{
    path: string;
    size: number;
  }>;
  errors?: string[];
}