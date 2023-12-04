# dev-tools

[![codecov](https://codecov.io/gh/educandu/dev-tools/branch/main/graph/badge.svg)](https://codecov.io/gh/educandu/dev-tools)

Development tools for educandu based systems and ESLint configuration shared between educandu projects.

## Prerequisites

* node.js ^18.0.0
* optional: globally installed gulp: `npm i -g gulp-cli`

The output of this repository is an npm package (`@educandu/dev-tools`).

## Installation

~~~
$ yarn add @educandu/dev-tools --dev
$ yarn add eslint eslint-plugin-import eslint-plugin-react eslint-plugin-react-hooks vitest @vitest/coverage-v8 --dev
~~~

## Usage of eslint configuration

Create a file `.eslint-config.cjs` containing:

~~~
module.exports = require('@educandu/dev-tools/eslint-config');
~~~

Extend this file in your local `.eslintrc.js`, for example:

~~~
module.exports = {
  extends: ['./.eslint-config.cjs'],
  overrides: [...]
};
~~~

## Usage of development tools

Use the dev tools in code as follows:

~~~
import {
  buildTranslationsJson,
  cliArgs,
  createGithubRelease,
  createLabelInJiraIssues,
  createReleaseNotesFromCurrentTag,
  downloadJson,
  ensureIsValidSemverTag,
  esbuild,
  eslint,
  getEnvAsString,
  jest,
  less,
  LoadBalancedNodeProcessGroup,
  MaildevContainer,
  MinioContainer,
  MongoContainer,
  NodeProcess,
  runInteractiveMigrations,
  TunnelProxyContainer
} from '@educandu/dev-tools';

await buildTranslationsJson({
  pattern: './**/*.yml',
  outputFile: './translations.json'
});

const { currentTag, releaseNotes, jiraIssueKeys } = await createReleaseNotesFromCurrentTag({
  jiraBaseUrl: cliArgs.jiraBaseUrl,
  jiraProjectKeys: cliArgs.jiraProjectKeys.split(',')
});

await createGithubRelease({
  githubToken: cliArgs.githubToken,
  currentTag,
  releaseNotes,
  files: []
});

await createLabelInJiraIssues({
  jiraBaseUrl: cliArgs.jiraBaseUrl,
  jiraUser: cliArgs.jiraUser,
  jiraApiKey: cliArgs.jiraApiKey,
  jiraIssueKeys,
  label: currentTag
});

await downloadJson('https://mydomain/my.json', './target.json');

ensureIsValidSemverTag('1.0.0');

await esbuild.transpileDir({
  inputDir: 'src',
  outputDir: 'dist',
  ignore: '**/*.spec.js'
});

// Note: `context` is only defined if `incremental` is set to `true`!
const context = await esbuild.bundle({
  entryPoints: ['./src/main.js'],
  outdir: './dist/dist',
  minify: true,
  incremental: true,
  inject: ['./src/polyfills.js'],
  metaFilePath: './reports/meta.json'
});

await context.rebuild();
await context.dispose();

await eslint.lint(['src/**/*.js'], { failOnError: true });

await eslint.fix(['src/**/*.js']);

const domain = getEnvAsString('DOMAIN');

await jest.coverage();

await jest.changed();

await jest.watch();

await less.compile({
  inputFile: 'src/main.less',
  outputFile: 'dist/main.css',
  optimize: true
});

const nodeApp = new NodeProcess({
  script: 'src/index.js',
  env: {
    ...process.env,
    PORT: 3000
  }
});

await nodeApp.start();
await nodeApp.restart();
await nodeApp.waitForExit();

const lbNodeApp = new LoadBalancedNodeProcessGroup({
  script: 'src/index.js',
  jsx: true,
  loadBalancerPort: 3000,
  getNodeProcessPort: index => 4000 + index,
  instanceCount: 3,
  getInstanceEnv: index => ({
    ...process.env,
    PORT: (4000 + index).toString()
  })
});

await lbNodeApp.start();
await lbNodeApp.restart();
await lbNodeApp.waitForExit();

const mongoContainer = new MongoContainer({
  port: 27017,
  rootUser: 'root',
  rootPassword: 'pw',
  replicaSetName: 'rsname'
});

await mongoContainer.ensureIsRunning();
await mongoContainer.ensureIsRemoved();

const minioContainer = new MinioContainer({
  port: 9000,
  accessKey: '435ZJV9F243DZ400KD',
  secretKey: '4837VZNC27NTZ24KTZU0X2ZTZ01TX',
  initialBuckets: ['my-bucket']
});

await minioContainer.ensureIsRunning();
await minioContainer.ensureIsRemoved();

const maildevContainer = new MaildevContainer({
  smtpPort: 8025,
  frontendPort: 8000
});

await maildevContainer.ensureIsRunning();
await maildevContainer.ensureIsRemoved();

const tunnelProxyContainer = new TunnelProxyContainer({
  name: 'tunnel',
  tunnelToken: ''0z543mh897h3j4rtxh,
  tunnelDomain: 'https://tunnel.com',
  localPort: 3000
});

await tunnelProxyContainer.ensureIsRunning();
await tunnelProxyContainer.ensureIsRemoved();

await runInteractiveMigrations({
  migrationsDirectory: 'migrations',
  migrationFileNamePattern: /^\d{4}-\d{2}-\d{2}-.*(?<!\.spec)(?<!\.specs)(?<!\.test)\.js$/
});
~~~

---

## OER learning platform for music

Funded by 'Stiftung Innovation in der Hochschullehre'

<img src="https://stiftung-hochschullehre.de/wp-content/uploads/2020/07/logo_stiftung_hochschullehre_screenshot.jpg)" alt="Logo der Stiftung Innovation in der Hochschullehre" width="200"/>

A Project of the 'Hochschule für Musik und Theater München' (University for Music and Performing Arts)

<img src="https://upload.wikimedia.org/wikipedia/commons/d/d8/Logo_Hochschule_f%C3%BCr_Musik_und_Theater_M%C3%BCnchen_.png" alt="Logo der Hochschule für Musik und Theater München" width="200"/>

Project owner: Hochschule für Musik und Theater München\
Project management: Ulrich Kaiser
