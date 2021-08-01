import { ExitFailedError } from "../errors";
import { gpExecSync } from "../utils";

export function workingTreeClean(): boolean {
  const changes = gpExecSync(
    {
      command: `git status --porcelain`,
    },
    (_) => {
      throw new ExitFailedError("Failed to determine changes. Aborting...");
    }
  )
    .toString()
    .trim();
  return changes.length === 0;
}
