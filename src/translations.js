import yaml from 'yaml';
import fse from 'fs-extra';
import path from 'node:path';
import { glob, kebabToCamel } from './helpers.js';

export async function buildTranslationsJson({ pattern, outputFile, createNamespace = filePath => kebabToCamel(path.basename(filePath, '.yml')) }) {
  const filePaths = await glob(pattern);
  const bundleGroups = await Promise.all(filePaths.map(async filePath => {
    const content = await fse.readFile(filePath, 'utf8');
    const resources = yaml.parse(content);
    if (!resources) {
      return [];
    }

    const bundlesByLanguage = {};
    const resourceKeys = Object.keys(resources);
    const namespace = createNamespace(filePath);

    resourceKeys.forEach(resourceKey => {
      const languages = Object.keys(resources[resourceKey]);
      languages.forEach(language => {
        let languageBundle = bundlesByLanguage[language];
        if (!languageBundle) {
          languageBundle = {
            namespace,
            language,
            resources: {}
          };
          bundlesByLanguage[language] = languageBundle;
        }
        languageBundle.resources[resourceKey] = resources[resourceKey][language];
      });
    });

    return Object.values(bundlesByLanguage);
  }));

  const result = bundleGroups.flatMap(x => x);

  await fse.writeJson(outputFile, result, { spaces: 2 });
}
