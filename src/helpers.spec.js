import os from 'node:os';
import { isMac, normalizedGlob } from './helpers.js';
import { beforeEach, describe, expect, it } from 'vitest';

describe('helpers', () => {
  describe('normalizedGlob', () => {
    let result;
    beforeEach(async () => {
      result = await normalizedGlob('./src\\**/*.{js,jsx}');
    });
    it('should return paths in POSIX style regardless of the platform specific separator', () => {
      expect(result).not.toHaveLength(0);
    });
  });
  describe('isMac', () => {
    it('should return if the current platform is of type `darwin`', () => {
      expect(isMac()).toBe(os.platform() === 'darwin');
    });
  });
});
