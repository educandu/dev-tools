import { kebabToCamel } from './helpers.js';
import { describe, expect, it } from 'vitest';

describe('helpers', () => {
  describe('kebabToCamel', () => {
    const testCases = [
      { input: 'hello-world', expected: 'helloWorld' },
      { input: 'hello--world', expected: 'helloWorld' },
      { input: 'hello--world--', expected: 'helloWorld' },
      { input: '--hello--world', expected: 'helloWorld' }
    ];

    testCases.forEach(({ input, expected }) => {
      it(`should convert '${input}' to '${expected}'`, () => {
        expect(kebabToCamel(input)).toBe(expected);
      });
    });
  });
});
