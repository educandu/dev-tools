import path from 'node:path';
import esbuildModule from 'esbuild';
import { promises as fs } from 'node:fs';
import { normalizedGlob } from './helpers.js';

function printSeparator(width) {
  console.log('-'.repeat(width));
}

function printWithSpaceInbetween([leftCol, rightCol], width) {
  console.log(`${leftCol}${' '.repeat(width - leftCol.length - rightCol.length)}${rightCol}`);
}

function formatBytes(bytes) {
  return `${(bytes / 1000).toFixed(2)} kB`;
}

function printMetafileTable(metafile) {
  const fileNamesAndBytes = Object.entries(metafile.outputs)
    .filter(([name]) => name.endsWith('.js') || name.endsWith('.jsx'))
    .map(([name, { bytes }]) => [name, bytes])
    .sort(([, bytesA], [, bytesB]) => bytesB - bytesA);

  const totalBytes = fileNamesAndBytes.reduce((sum, [, bytes]) => sum + bytes, 0);
  const formattedRows = fileNamesAndBytes.map(([name, bytes]) => [name, formatBytes(bytes)]);
  const longestRow = formattedRows.reduce((maxValue, [leftCol, rightCol]) => Math.max(maxValue, leftCol.length + rightCol.length), 0);
  const tableWidth = Math.max(60, longestRow + 3);

  printWithSpaceInbetween(['FILE', 'SIZE'], tableWidth);
  printSeparator(tableWidth);
  formattedRows.forEach(row => printWithSpaceInbetween(row, tableWidth));
  printSeparator(tableWidth);
  printWithSpaceInbetween(['TOTAL', formatBytes(totalBytes)], tableWidth);
}

export const esbuild = {
  async transpileDir({ inputDir, outputDir, ignore = [], ...rest }) {
    const inputPattern = path.join(inputDir, './**/*.{js,jsx}');
    const files = await normalizedGlob(inputPattern, { ignore });
    await Promise.all(files.map(file => {
      return esbuildModule.build({
        entryPoints: [file],
        target: ['esnext'],
        format: 'esm',
        loader: { '.js': 'jsx' },
        sourcemap: true,
        sourcesContent: true,
        outfile: path.resolve(outputDir, path.relative(inputDir, file)),
        ...rest
      });
    }));
  },
  async bundle({ entryPoints, outdir, environment = process.env.NODE_ENV, minify = false, incremental = false, inject = [], metaFilePath = null, ...rest }) {
    const options = {
      entryPoints,
      target: ['esnext', 'chrome95', 'firefox93', 'safari13', 'edge95'],
      format: 'esm',
      bundle: true,
      splitting: true,
      minify: !!minify,
      loader: { '.js': 'jsx' },
      inject,
      metafile: !!metaFilePath,
      sourcemap: true,
      sourcesContent: true,
      outdir,
      define: { 'process.env.NODE_ENV': JSON.stringify(environment), ...rest.define },
      ...rest
    };

    const context = await esbuildModule.context(options);
    const buildResult = await context.rebuild();

    if (metaFilePath) {
      printMetafileTable(buildResult.metafile);
      await fs.writeFile(metaFilePath, JSON.stringify(buildResult.metafile, null, 2), 'utf8');
    }

    if (incremental) {
      return context;
    }

    await context.dispose();
    return null;
  }
};
