import { describe, it, expect } from 'vitest';
import { sheetName } from './sheetName';

describe('sheetName', () => {
  it('replaces the characters Excel refuses', () => {
    expect(sheetName('Push / Pull / Legs', new Set())).toBe('Push - Pull - Legs');
    expect(sheetName('A:B\\C?D*E[F]', new Set())).toBe('A-B-C-D-E-F-');
  });

  it('keeps to 31 characters', () => {
    expect(sheetName('x'.repeat(40), new Set())).toHaveLength(31);
  });

  it('names an empty title', () => {
    expect(sheetName('   ', new Set())).toBe('Plan');
  });

  it('never repeats a name, ignoring case', () => {
    expect(sheetName('Summary', new Set(['summary']))).toBe('Summary (2)');
    expect(sheetName('Legs', new Set(['Legs', 'Legs (2)']))).toBe('Legs (3)');
    expect(sheetName('y'.repeat(31), new Set(['y'.repeat(31)]))).toHaveLength(31);
  });
});
