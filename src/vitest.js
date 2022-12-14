import url from 'node:url';
import path from 'node:path';
import { execa } from 'execa';
import { createRequire } from 'node:module';

const getVitestBinFromRootPackage = () => {
  const thisModuleUrl = import.meta.url;
  const rootPackageIndex = thisModuleUrl.indexOf('/node_modules/');
  if (rootPackageIndex === -1) {
    return null;
  }

  const rootPackageFolderUrl = thisModuleUrl.substring(0, rootPackageIndex);
  const vitestBinUrl = `${rootPackageFolderUrl}/node_modules/.bin/vitest`;
  return url.fileURLToPath(vitestBinUrl);
};

const getVitestCliModuleFromResolve = () => {
  const require = createRequire(import.meta.url);
  const resolvedVitestPackage = require.resolve('vitest/package.json');
  const index = resolvedVitestPackage.replaceAll('\\', '/').lastIndexOf('/node_modules/vitest/');
  const rootDir = resolvedVitestPackage.substring(0, index);
  return path.resolve(rootDir, './node_modules/vitest/vitest.mjs');
};

const vitestToExecute = getVitestBinFromRootPackage() || getVitestCliModuleFromResolve();

function runVitest(command, ...args) {
  return execa(process.execPath, [vitestToExecute, command, ...args], { stdio: 'inherit' });
}

export const vitest = {
  coverage(...args) {
    return runVitest('run', '--coverage', ...args);
  },
  watch(...args) {
    return runVitest('watch', ...args);
  }
};
