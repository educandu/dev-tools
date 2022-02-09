import { kebabToCamel } from './helpers.js';

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
