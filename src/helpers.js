import os from 'node:os';
import axios from 'axios';
import JSZip from 'jszip';
import fse from 'fs-extra';
import path from 'node:path';
import globModule from 'glob';
import { promisify } from 'node:util';
import jsonToEsModule from 'json-to-es-module';

export function delay(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

export const glob = promisify(globModule);

export function isMac() {
  return os.platform() === 'darwin';
}

export function kebabToCamel(str) {
  return str
    .replace(/^-+/, '')
    .replace(/-[a-z0-9]/g, c => c.toUpperCase())
    .replace(/-/g, '');
}

export function noop() {}

export async function writeZipFile(fileName, fileMap) {
  const archive = new JSZip();

  for (const [key, value] of Object.entries(fileMap)) {
    // eslint-disable-next-line no-await-in-loop
    archive.file(key, await fse.readFile(value));
  }

  await fse.ensureDir(path.dirname(fileName));
  await fse.writeFile(fileName, await archive.generateAsync({ type: 'nodebuffer' }));
}

export async function downloadJson(url, fileName, { format } = { format: 'json' }) {
  const res = await axios.get(url, { responseType: 'json' });
  let output;
  switch (format) {
    case 'json':
      output = JSON.stringify(res.data, null, 2);
      break;
    case 'esm':
      output = jsonToEsModule(JSON.stringify(res.data)).replace(/\t/g, '  ');
      break;
    default:
      throw new Error(`Invalid format value: '${format}'`);
  }

  await fse.writeFile(fileName, `${output.replace(/\r/g, '').replace(/\n/g, os.EOL).trim()}${os.EOL}`, 'utf8');
}
