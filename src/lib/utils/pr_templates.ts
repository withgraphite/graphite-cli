import fs from "fs-extra";
import path from "path";
import { currentGitRepoPrecondition } from "../preconditions";

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
  let filepaths: string[] = [];

  const prTemplateLocations = [
    repoPath,
    path.join(repoPath, ".github"),
    path.join(repoPath, "docs"),
  ].filter((location) => {
    return fs.existsSync(location);
  });

  prTemplateLocations.forEach((location) => {
    filepaths = filepaths.concat(findSinglePRTemplate(location));
  });
  prTemplateLocations.forEach((location) => {
    filepaths = filepaths.concat(findMultiplePRTemplates(location));
  });

  return filepaths;
}

function findSinglePRTemplate(folderPath: string): string[] {
  const files = fs
    .readdirSync(folderPath, { withFileTypes: true })
    .filter((entry) => {
      if (
        entry.isFile() &&
        isPRTemplateFiletype(entry.name) &&
        entry.name.match(/^pull_request_template\./gi) !== null
      ) {
        return true;
      }
      return false;
    });
  return files.map((file) => path.join(folderPath, file.name));
}

function findMultiplePRTemplates(folderPath: string): string[] {
  let templates: string[] = [];

  fs.readdirSync(folderPath, { withFileTypes: true }).forEach((entry) => {
    if (!entry.isDirectory()) {
      return;
    }
    if (entry.name.match(/^pull_request_template$/gi) !== null) {
      templates = templates.concat(
        fs
          .readdirSync(path.join(folderPath, entry.name))
          .filter((filename) => isPRTemplateFiletype(filename))
          .map((filename) => path.join(folderPath, entry.name, filename))
      );
    }
  });
  return templates;
}

function isPRTemplateFiletype(filename: string): boolean {
  return filename.endsWith(".txt") || filename.endsWith(".md");
}
