import url from 'node:url';
import path from 'node:path';
import { EOL } from 'node:os';
import inquirer from 'inquirer';
import { normalizedGlob } from './helpers.js';
import { MongoDBStorage, Umzug } from 'umzug';
import { MongoClient, ServerApiVersion } from 'mongodb';

export async function runInteractiveMigrations({ migrationsDirectory, migrationFileNamePattern, recursive = false }) {
  let mongoClient;

  try {
    const migrationFiles = await normalizedGlob(path.join(migrationsDirectory, recursive ? './**/*.js' : './*.js'));
    const migrationInfos = migrationFiles
      .filter(fileName => migrationFileNamePattern.test(path.basename(fileName)))
      .sort()
      .map(fileName => ({
        name: path.basename(fileName, '.js'),
        filePath: path.resolve(fileName)
      }));

    const { connectionString, migrationsCollection } = await inquirer.prompt([
      {
        message: 'Connection string:',
        name: 'connectionString',
        type: 'input',
        filter: s => (s || '').trim(),
        validate: s => !s || !s.trim() ? 'Please provide a value' : true
      },
      {
        message: 'Migrations collection name:',
        name: 'migrationsCollection',
        type: 'input',
        default: 'migrations',
        filter: s => (s || '').trim(),
        validate: s => !s || !s.trim() ? 'Please provide a value' : true
      }
    ]);

    mongoClient = await MongoClient.connect(connectionString, { serverApi: ServerApiVersion.v1 });

    await Promise.all(migrationInfos.map(async info => {
      const Migration = (await import(url.pathToFileURL(info.filePath).href)).default;
      const instance = new Migration(mongoClient.db(), mongoClient);
      instance.name = info.name;
      info.migration = instance;
    }));

    const umzug = new Umzug({
      migrations: migrationInfos.map(info => info.migration),
      storage: new MongoDBStorage({ collection: mongoClient.db().collection(migrationsCollection) }),
      logger: console
    });

    umzug.on('migrated', ({ name }) => console.log(`Finished migrating ${name}`));

    const executedMigrationNames = (await umzug.executed()).map(migration => migration.name);

    migrationInfos.forEach(info => {
      info.isExecuted = executedMigrationNames.includes(info.name);
    });

    const migrationChoices = migrationInfos.map(info => ({
      name: `${info.isExecuted ? '🔄' : '  '} ${info.name}`,
      value: info.name
    }));

    const { migrationsToRun, isConfirmed } = await inquirer.prompt([
      {
        message: 'Migrations to run:',
        name: 'migrationsToRun',
        type: 'checkbox',
        choices: migrationChoices,
        pageSize: migrationChoices.length + 1,
        loop: false
      },
      {
        when: currentAnswers => !!currentAnswers.migrationsToRun.length,
        message: currentAnswers => [
          'You have selected the follwing migrations:',
          ...currentAnswers.migrationsToRun,
          'Do you want to run them now?'
        ].join(EOL),
        name: 'isConfirmed',
        type: 'confirm'
      }
    ]);

    if (!isConfirmed) {
      console.log('No migration will be run, quitting');
      return;
    }

    console.log(`Running ${migrationsToRun.length} ${migrationsToRun.length === 1 ? 'migration' : 'migrations'}`);
    await umzug.up({ migrations: migrationsToRun, rerun: 'ALLOW' });
  } finally {
    await mongoClient?.close();
  }
}
