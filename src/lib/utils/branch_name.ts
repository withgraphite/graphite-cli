import { TContext } from '../context';

// 255 minus 21 (for 'refs/branch-metadata/')
const MAX_BRANCH_NAME_BYTE_LENGTH = 234;
const BRANCH_NAME_REPLACE_REGEX = /[^-_a-zA-Z0-9]+/g;

function replaceUnsupportedCharacters(input: string): string {
  return input.replace(BRANCH_NAME_REPLACE_REGEX, '_');
}

export function newBranchName(
  branchName: string | undefined,
  commitMessage: string | undefined,
  context: TContext
): string | undefined {
  if (branchName) {
    return replaceUnsupportedCharacters(branchName);
  }

  if (!commitMessage) {
    return undefined;
  }

  const branchPrefix = context.userConfig.data.branchPrefix || '';

  const date = new Date();
  const branchDate = `${('0' + (date.getMonth() + 1)).slice(-2)}-${(
    '0' + date.getDate()
  ).slice(-2)}-`;

  const branchMessage = replaceUnsupportedCharacters(commitMessage);

  // https://stackoverflow.com/questions/60045157/what-is-the-maximum-length-of-a-github-branch-name
  // GitHub's max branch name size is computed based on a maximum ref name length of 256 bytes.
  // We only allow single-byte characters in branch names
  return (branchPrefix + branchDate + branchMessage).slice(
    0,
    MAX_BRANCH_NAME_BYTE_LENGTH
  );
}

export function setBranchPrefix(newPrefix: string, context: TContext): string {
  const prefix = replaceUnsupportedCharacters(newPrefix);
  context.userConfig.update((data) => (data.branchPrefix = prefix));
  return prefix;
}
