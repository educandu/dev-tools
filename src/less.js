import path from 'path';
import Less from 'less';
import fse from 'fs-extra';
import CleanCss from 'clean-css';
import { promisify } from 'util';
import LessAutoprefix from 'less-plugin-autoprefix';

async function compileLess({ inputFile, outputFile, optimize }) {
  const sourceMapOutputFile = `${outputFile}.map`;
  const relativeSourceMapUrl = path.basename(sourceMapOutputFile);

  const lessInput = await fse.readFile(inputFile, 'utf8');
  const lessOutput = await Less.render(lessInput, {
    filename: inputFile,
    javascriptEnabled: true,
    plugins: [new LessAutoprefix({ browsers: ['last 2 versions', 'Safari >= 13'] })],
    sourceMap: { sourceMapBasepath: process.cwd(), sourceMapURL: relativeSourceMapUrl, outputSourceFiles: true }
  });

  let finalResult;
  if (optimize) {
    const cleanCss = new CleanCss({ rebase: false, sourceMap: true, sourceMapInlineSources: true });
    const cleanCssOutput = await promisify(cleanCss.minify.bind(cleanCss))(lessOutput.css, lessOutput.map.toString());
    finalResult = {
      css: `${cleanCssOutput.styles}\n/*# sourceMappingURL=${relativeSourceMapUrl} */`,
      map: cleanCssOutput.sourceMap.toString()
    };
  } else {
    finalResult = {
      css: lessOutput.css,
      map: lessOutput.map.toString()
    };
  }

  await Promise.all([
    fse.writeFile(outputFile, finalResult.css, 'utf8'),
    fse.writeFile(sourceMapOutputFile, finalResult.map, 'utf8')
  ]);
}

export const less = {
  compile({ inputFile, outputFile, optimize = false }) {
    return compileLess({ inputFile, outputFile, optimize });
  }
};
