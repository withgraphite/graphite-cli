import { gpExecSync, logInternalErrorAndExit } from "../utils";

export function workingTreeClean(): boolean {
  const changes = gpExecSync(
    {
      command: `git status --porcelain`,
    },
    (_) => {
      logInternalErrorAndExit("Failed to determine changes. Aborting...");
    }
  )
    .toString()
    .trim();
  return changes.length === 0;
}
