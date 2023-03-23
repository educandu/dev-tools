import os from 'node:os';
import { execa } from 'execa';

function runVitest(command, ...args) {
  const execaOptions = { stdio: 'inherit' };
  return os.platform() === 'win32'
    ? execa('./node_modules/.bin/vitest.cmd', [command, ...args], execaOptions)
    : execa(process.execPath, ['./node_modules/.bin/vitest', command, ...args], execaOptions);
}

export const vitest = {
  coverage(...args) {
    return runVitest('run', '--coverage', ...args);
  },
  watch(...args) {
    return runVitest('watch', ...args);
  }
};
