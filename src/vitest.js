import path from 'path';
import { execa } from 'execa';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const resolvedVitestPackage = require.resolve('vitest/package.json');
const index = resolvedVitestPackage.replaceAll('\\', '/').lastIndexOf('/node_modules/vitest/');
const rootDir = resolvedVitestPackage.substring(0, index);
const vitestCliModule = path.resolve(rootDir, './node_modules/vitest/dist/cli.mjs');

function runVitest(command, ...args) {
  return execa(process.execPath, [vitestCliModule, command, ...args], { stdio: 'inherit' });
}

export const vitest = {
  coverage(...args) {
    return runVitest('run', '--coverage', ...args);
  },
  watch(...args) {
    return runVitest('watch', ...args);
  }
};
