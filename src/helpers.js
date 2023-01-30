import yaml from 'yaml';
import os from 'node:os';
import JSZip from 'jszip';
import fse from 'fs-extra';
import path from 'node:path';
import globModule from 'glob';
import extend from 'just-extend';
import { promisify } from 'node:util';

export function delay(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

export const glob = promisify(globModule);

export function isMac() {
  return os.platform() === 'darwin';
}

export function noop() {}

export async function writeZipFile(fileName, fileMap) {
  const archive = new JSZip();

  for (const [key, value] of Object.entries(fileMap)) {
    archive.file(key, await fse.readFile(value));
  }

  await fse.ensureDir(path.dirname(fileName));
  await fse.writeFile(fileName, await archive.generateAsync({ type: 'nodebuffer' }));
}

export async function mergeYamlFilesToJson({ inputFilesPattern, outputFile }) {
  const filePaths = await glob(inputFilesPattern);
  const translations = await Promise.all(filePaths.map(async filePath => {
    const fileContent = await fse.readFile(filePath, 'utf8');
    return yaml.parse(fileContent);
  }));

  const mergedTranslations = extend({}, ...translations);

  await fse.writeJson(outputFile, mergedTranslations, { spaces: 2 });
}
