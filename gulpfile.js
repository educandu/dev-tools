import gulp from 'gulp';
import { deleteAsync } from 'del';
import {
  cliArgs,
  createGithubRelease,
  createLabelInJiraIssues,
  createReleaseNotesFromCurrentTag,
  ensureIsValidSemverTag,
  eslint,
  vitest
} from './src/index.js';

export async function clean() {
  await deleteAsync(['coverage']);
}

export function lint() {
  return eslint.lint(['*.js', 'src/**/*.js'], { failOnError: true });
}

export function fix() {
  return eslint.fix(['*.js', 'src/**/*.js']);
}

export function test() {
  return vitest.coverage();
}

export function testWatch() {
  return vitest.watch();
}

export function verifySemverTag(done) {
  ensureIsValidSemverTag(cliArgs.tag);
  done();
}

export async function release() {
  const { currentTag, releaseNotes, jiraIssueKeys } = await createReleaseNotesFromCurrentTag({
    jiraBaseUrl: cliArgs.jiraBaseUrl,
    jiraProjectKeys: cliArgs.jiraProjectKeys.split(',')
  });

  await createGithubRelease({
    githubToken: cliArgs.githubToken,
    currentTag,
    releaseNotes
  });

  await createLabelInJiraIssues({
    jiraBaseUrl: cliArgs.jiraBaseUrl,
    jiraUser: cliArgs.jiraUser,
    jiraApiKey: cliArgs.jiraApiKey,
    jiraIssueKeys,
    label: currentTag
  });
}

export const verify = gulp.series(lint, test);

export const build = gulp.series(clean);

export default verify;
