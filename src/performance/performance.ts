export function measureTime(startTime: number): string {
  const elapsed = performance.now() - startTime;
  
  if (elapsed < 1000) {
    return `${Math.round(elapsed)}ms`;
  }
  
  if (elapsed < 60000) {
    return `${(elapsed / 1000).toFixed(1)}s`;
  }
  
  return `${(elapsed / 60000).toFixed(1)}m`;
}