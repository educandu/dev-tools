import os from 'node:os';
import { isMac } from './helpers.js';
import { describe, expect, it } from 'vitest';

describe('helpers', () => {
  describe('isMac', () => {
    it('should return if the current platform is of type `darwin`', () => {
      expect(isMac()).toBe(os.platform() === 'darwin');
    });
  });
});
