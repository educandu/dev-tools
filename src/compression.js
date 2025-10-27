import fse from 'fs-extra';
import { glob } from 'glob';
import path from 'node:path';
import zlib from 'node:zlib';
import { promisify } from 'node:util';

const gzipAsync = promisify(zlib.gzip);
const brotliAsync = promisify(zlib.brotliCompress);

export async function compressFiles({ sourceDir, minSize = 1024, patterns = '**/*.{js,css,html,svg,json,xml,txt,map}', override = false }) {
  const directories = Array.isArray(sourceDir) ? sourceDir : [sourceDir];
  const files = [];
  for (const directory of directories) {
    const results = await glob(`${directory}/${patterns}`, { nodir: true });
    files.push(...results.map(result => path.resolve(result)));
  }

  console.log(`\nCompressing ${files.length} files`);
  console.log('='.repeat(60));

  const stats = {
    processed: 0,
    skipped: 0,
    gzipCreated: 0,
    gzipSkipped: 0,
    brotliCreated: 0,
    brotliSkipped: 0,
    originalSize: 0,
    gzipSize: 0,
    brotliSize: 0
  };

  for (const filePath of files) {
    try {
      const content = await fse.readFile(filePath);
      stats.originalSize += content.length;

      if (content.length < minSize) {
        stats.skipped += 1;
      } else {
        const filename = path.basename(filePath);
        const gzipPath = `${filePath}.gz`;
        const brotliPath = `${filePath}.br`;

        // Check if compressed files already exist
        const gzipExists = !override && await fse.pathExists(gzipPath);
        const brotliExists = !override && await fse.pathExists(brotliPath);

        // Gzip
        if (gzipExists) {
          stats.gzipSkipped += 1;
          console.log(`⊘ ${filename}.gz (already exists)`);
        } else {
          const gzipped = await gzipAsync(content, { level: 9 });
          if (gzipped.length < content.length) {
            await fse.writeFile(gzipPath, gzipped);
            stats.gzipCreated += 1;
            stats.gzipSize += gzipped.length;
            const ratio = ((1 - gzipped.length / content.length) * 100).toFixed(1);
            console.log(`✓ ${filename}.gz (${ratio}% smaller)`);
          }
        }

        // Brotli
        if (brotliExists) {
          stats.brotliSkipped += 1;
          console.log(`⊘ ${filename}.br (already exists)`);
        } else {
          const brotlied = await brotliAsync(content, {
            params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 11 }
          });
          if (brotlied.length < content.length) {
            await fse.writeFile(brotliPath, brotlied);
            stats.brotliCreated += 1;
            stats.brotliSize += brotlied.length;
            const ratio = ((1 - brotlied.length / content.length) * 100).toFixed(1);
            console.log(`✓ ${filename}.br (${ratio}% smaller)`);
          }
        }

        stats.processed += 1;

      }
    } catch (error) {
      console.error(`✗ Error: ${filePath} - ${error.message}`);
      throw error;
    }
  }

  // Summary
  console.log('='.repeat(60));
  console.log(`Processed: ${stats.processed} files`);
  console.log(`Skipped: ${stats.skipped} files (too small)`);
  console.log(`Created: ${stats.gzipCreated} .gz files, ${stats.brotliCreated} .br files`);
  if (stats.gzipSkipped > 0 || stats.brotliSkipped > 0) {
    console.log(`Skipped: ${stats.gzipSkipped} .gz files, ${stats.brotliSkipped} .br files (already exist)`);
  }

  if (stats.gzipSize > 0) {
    const gzipRatio = ((1 - stats.gzipSize / stats.originalSize) * 100).toFixed(1);
    console.log(`Gzip savings: ${gzipRatio}%`);
  }
  if (stats.brotliSize > 0) {
    const brotliRatio = ((1 - stats.brotliSize / stats.originalSize) * 100).toFixed(1);
    console.log(`Brotli savings: ${brotliRatio}%`);
  }
  console.log('');
}
