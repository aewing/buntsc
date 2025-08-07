import { test, expect, describe } from 'bun:test';
import { measureTime } from './performance';

describe('measureTime', () => {
  test('should format milliseconds correctly', () => {
    const startTime = performance.now() - 500;
    const result = measureTime(startTime);
    expect(result).toMatch(/^\d+ms$/);
  });

  test('should format seconds correctly', () => {
    const startTime = performance.now() - 5500;
    const result = measureTime(startTime);
    expect(result).toMatch(/^\d+\.\ds$/);
  });

  test('should format minutes correctly', () => {
    const startTime = performance.now() - 65000;
    const result = measureTime(startTime);
    expect(result).toMatch(/^\d+\.\dm$/);
  });

  test('should handle edge cases', () => {
    expect(measureTime(performance.now())).toBe('0ms');
    expect(measureTime(performance.now() - 999)).toMatch(/^\d+ms$/);
    expect(measureTime(performance.now() - 1000)).toMatch(/^\d\.\ds$/);
    expect(measureTime(performance.now() - 59999)).toMatch(/^\d+\.\ds$/);
    expect(measureTime(performance.now() - 60000)).toMatch(/^\d\.\dm$/);
  });
});