import url from 'node:url';
import { ESLint } from 'eslint';
import { promises as fs } from 'node:fs';
import eslintConfig from './eslint-config.cjs';
import { beforeEach, describe, expect, it } from 'vitest';

const testFilesDir = url.fileURLToPath(new URL('./eslint-test-files', import.meta.url));

// As the actual eslint-test-files folder is globally ignored,
// we pretend towards eslint that the test files actually come from here:
const pretendtestFilesDir = url.fileURLToPath(new URL('./non-ignored-test-files', import.meta.url));

describe('eslint-config', () => {
  let eslint;

  beforeEach(() => {
    eslint = new ESLint({ overrideConfig: eslintConfig, useEslintrc: false });
  });

  describe('when used on a file not containing any errors', () => {
    let results;

    beforeEach(async () => {
      const sourceCode = await fs.readFile(`${testFilesDir}/test-file-without-error.js`, 'utf8');
      results = await eslint.lintText(sourceCode, { filePath: `${pretendtestFilesDir}/test-file-without-error.js` });
    });

    it('should not report any error', () => {
      expect(results.length).toBe(1);
      expect(results[0].errorCount).toBe(0);
    });
  });

  describe('when used on a file containing an error', () => {
    let results;

    beforeEach(async () => {
      const sourceCode = await fs.readFile(`${testFilesDir}/test-file-with-error.js`, 'utf8');
      results = await eslint.lintText(sourceCode, { filePath: `${pretendtestFilesDir}/test-file-with-error.js` });
    });

    it('should report the error', () => {
      expect(results.length).toBe(1);
      expect(results[0].errorCount).toBe(1);
      expect(results[0].messages[0].severity).toBe(2);
      expect(results[0].messages[0].ruleId).toBe('semi');
      expect(results[0].messages[0].message).toBe('Missing semicolon.');
    });
  });

  describe('when used on a file containing a JSX error', () => {
    let results;

    beforeEach(async () => {
      const sourceCode = await fs.readFile(`${testFilesDir}/test-file-with-jsx-error.js`, 'utf8');
      results = await eslint.lintText(sourceCode, { filePath: `${pretendtestFilesDir}/test-file-with-jsx-error.js` });
    });

    it('should report the error', () => {
      expect(results.length).toBe(1);
      expect(results[0].errorCount).toBe(1);
      expect(results[0].messages[0].severity).toBe(2);
      expect(results[0].messages[0].ruleId).toBe('react/jsx-max-props-per-line');
      expect(results[0].messages[0].message).toBe('Prop `title` must be placed on a new line');
    });
  });

});
