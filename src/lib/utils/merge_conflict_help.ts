import { gpExecSync, logInfo, rebaseInProgress } from ".";

export function printGraphiteMergeConflictStatus(): void {
  if (!rebaseInProgress()) {
    return;
  }

  const statusOutput = gpExecSync({
    command: `git status`,
  })
    .toString()
    .trim();

  const output = [
    statusOutput.replace("git rebase --continue", "gt continue"),
  ].join("\n");

  logInfo(output);
}
