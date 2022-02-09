import { ESLint } from 'eslint';

async function runEslint(patterns, { fix, failOnError }) {
  const instance = new ESLint({ fix });
  const results = await instance.lintFiles(patterns);

  if (fix) {
    await ESLint.outputFixes(results);
  }

  const formatter = await instance.loadFormatter('stylish');
  const resultText = formatter.format(results);

  if (resultText) {
    // eslint-disable-next-line no-console
    console.log(resultText);
  }

  if (failOnError) {
    const totalResult = results.reduce((accu, result) => ({
      errorCount: accu.errorCount + result.errorCount,
      fatalErrorCount: accu.fatalErrorCount + result.fatalErrorCount,
      warningCount: accu.warningCount + result.warningCount,
      fixableErrorCount: accu.fixableErrorCount + result.fixableErrorCount,
      fixableWarningCount: accu.fixableWarningCount + result.fixableWarningCount
    }), {
      errorCount: 0,
      fatalErrorCount: 0,
      warningCount: 0,
      fixableErrorCount: 0,
      fixableWarningCount: 0
    });

    const totalErrors = totalResult.fatalErrorCount + totalResult.errorCount;
    if (totalErrors) {
      throw new Error(`ESLint failed with ${totalErrors} ${totalErrors === 1 ? 'error' : 'errors'}`);
    }
  }
}

export const eslint = {
  lint(patterns, { failOnError = false } = { failOnError: false }) {
    return runEslint(patterns, { fix: false, failOnError });
  },
  fix(patterns, { failOnError = false } = { failOnError: false }) {
    return runEslint(patterns, { fix: true, failOnError });
  }
};
