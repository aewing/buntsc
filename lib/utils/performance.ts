export function measureTime(startTime: number): string {
  const elapsed = performance.now() - startTime;
  
  if (elapsed < 1000) {
    return `${elapsed.toFixed(0)}ms`;
  }
  
  return `${(elapsed / 1000).toFixed(2)}s`;
}