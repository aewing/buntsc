import { test, expect, describe } from 'bun:test';
import { measureTime } from '../lib/utils/performance';

describe('Performance utilities', () => {
  test('should format time in milliseconds for short durations', () => {
    const startTime = performance.now();
    const result = measureTime(startTime - 500);
    expect(result).toMatch(/^\d+ms$/);
  });

  test('should format time in seconds for long durations', () => {
    const startTime = performance.now();
    const result = measureTime(startTime - 1500);
    expect(result).toMatch(/^\d+\.\d{2}s$/);
  });

  test('should handle edge case of 1000ms', () => {
    const startTime = performance.now();
    const result = measureTime(startTime - 1000);
    expect(result).toBe('1.00s');
  });

  test('should handle very small durations', () => {
    const startTime = performance.now();
    const result = measureTime(startTime - 0.5);
    expect(result).toBe('1ms');
  });
});