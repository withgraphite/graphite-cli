import { gpExecSync } from ".";
import { ExitFailedError } from "../errors";
export function uncommittedChanges(): boolean {
  return (
    gpExecSync(
      {
        command: `git status --porcelain=v1 2>/dev/null | wc -l`,
      },
      (err) => {
        throw new ExitFailedError(
          `Failed to check current dir for uncommitted changes.`,
          err
        );
      }
    )
      .toString()
      .trim() !== "0"
  );
}
