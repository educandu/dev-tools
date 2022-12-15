import { execa } from 'execa';

const VITEST_BIN_PATH = './node_modules/.bin/vitest';

function runVitest(command, ...args) {
  return execa(process.execPath, [VITEST_BIN_PATH, command, ...args], { stdio: 'inherit' });
}

export const vitest = {
  coverage(...args) {
    return runVitest('run', '--coverage', ...args);
  },
  watch(...args) {
    return runVitest('watch', ...args);
  }
};
