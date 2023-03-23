import Less from 'less';
import os from 'node:os';
import fse from 'fs-extra';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

class CustomFileManager extends Less.FileManager {
  loadFile(filename, currentDirectory, options, environment, callback) {
    let result;
    if (!filename.startsWith('.')) {
      try {
        console.log('HA', filename);
        const resolvedFilename = require.resolve(filename);
        if (fse.existsSync(resolvedFilename)) {
          const readFileArgs = [resolvedFilename];
          if (!options.rawBuffer) {
            readFileArgs.push('utf-8');
          }
          const contents = fse.readFileSync(...readFileArgs);
          result = { contents, filename: resolvedFilename };
        }
      } catch {
        result = null;
      }
    }

    if (callback) {
      return result
        ? callback(null, result)
        : super.loadFile(filename, currentDirectory, options, environment, callback);
    }

    if (result && options.syncImport) {
      return result;
    }

    return result
      ? Promise.resolve(result)
      : super.loadFile(filename, currentDirectory, options, environment, callback);
  }
}

export default class LessPluginFixedFileImport {
  constructor() {
    this.minVersion = [2, 0, 0];
  }

  install(_, pluginManager) {
    if (os.platform() === 'win32') {
      // The default LESS FileManager tries to import npm modules
      // on Windows with the Windows path separator (backslash),
      // which of course doesn't work, so we add this custom
      // FileManager implementation in case of Windows OS.
      pluginManager.addFileManager(new CustomFileManager());
    }
  }
}
