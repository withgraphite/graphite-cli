import { gpExecSync } from ".";
import { ExitFailedError } from "../errors";
export function uncommittedChanges(): boolean {
  return (
    gpExecSync(
      {
        command: `git status --porcelain=v1 2>/dev/null | wc -l`,
      },
      () => {
        throw new ExitFailedError(
          `Failed to check current dir for uncommitted changes.`
        );
      }
    )
      .toString()
      .trim() !== "0"
  );
}
