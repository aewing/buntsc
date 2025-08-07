export interface WatchOptions {
  project: string;
  outdir: string;
  target?: 'bun' | 'node' | 'browser';
  minify?: boolean;
  sourcemap?: boolean;
  splitting?: boolean;
  external?: string[];
  preserveWatchOutput?: boolean;
}