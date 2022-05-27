import fs from 'fs-extra';
import path from 'path';
import prompts from 'prompts';
import { KilledError } from '../errors';
import { currentGitRepoPrecondition } from '../preconditions';

export async function getPRTemplate(): Promise<string | undefined> {
  const templateFiles = getPRTemplateFilepaths();
  if (templateFiles.length === 0) {
    return undefined;
  }

  return fs
    .readFileSync(
      templateFiles.length === 1
        ? templateFiles[0]
        : (
            await prompts(
              {
                type: 'select',
                name: 'templateFilepath',
                message: `Body Template`,
                choices: templateFiles.map((file) => {
                  return {
                    title: getRelativePathFromRepo(file),
                    value: file,
                  };
                }),
              },
              {
                onCancel: () => {
                  throw new KilledError();
                },
              }
            )
          ).templateFilepath
    )
    .toString();
}

function getRelativePathFromRepo(path: string): string {
  const repoPath = currentGitRepoPrecondition();
  return path.replace(repoPath, '');
}

/**
 * Returns GitHub PR templates, following the order of precedence GitHub uses
 * when creating a new PR.
 *
 * Summary:
 * - All PR templates must be located in 1) the top-level repo directory 2)
 *   a .github/ directory or 3) a docs/ directory.
 * - GitHub allows you to define a single default PR template by naming it
 *   pull_request_template (case-insensitive) with either a .md or .txt
 *   file extension. If one of these is provided, GitHub autofills the body
 *   field on the PR creation page -- unless it is overridden with a template
 *   query param.
 * - If you have multiple PR templates, you can put them in a
 *   PULL_REQUEST_TEMPLATE directory in one of the PR locations above. However,
 *   at PR creation time, GitHub doesn't autofill the body field on the PR
 *   creation page unless you tell it which template to use via a (URL) query
 *   param.
 *
 * More Info:
 * - https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/about-issue-and-pull-request-templates
 * - https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/creating-a-pull-request-template-for-your-repository
 *
 */
export function getPRTemplateFilepaths(): string[] {
  const repoPath = currentGitRepoPrecondition();
  const prTemplateLocations = [
    repoPath,
    path.join(repoPath, '.github'),
    path.join(repoPath, 'docs'),
  ].filter((location) => fs.existsSync(location));

  return prTemplateLocations
    .map((location) => findSinglePRTemplate(location))
    .concat(
      prTemplateLocations.map((location) => findMultiplePRTemplates(location))
    )
    .reduce((acc, curr) => acc.concat(curr), []);
}

function findSinglePRTemplate(folderPath: string): string[] {
  return fs
    .readdirSync(folderPath, { withFileTypes: true })
    .filter(
      (entry) =>
        entry.isFile() &&
        entry.name.match(/^pull_request_template\./gi) !== null
    )
    .map((file) => path.join(folderPath, file.name));
}

function findMultiplePRTemplates(folderPath: string): string[] {
  return fs
    .readdirSync(folderPath, { withFileTypes: true })
    .filter(
      (entry) =>
        entry.isDirectory() &&
        entry.name.match(/^pull_request_template$/gi) !== null
    )
    .map((entry) =>
      fs
        .readdirSync(path.join(folderPath, entry.name))
        .map((filename) => path.join(folderPath, entry.name, filename))
    )
    .reduce((acc, curr) => acc.concat(curr), []);
}
