import { gpExecSync } from ".";
import { ExitFailedError } from "../errors";
export function unStagedChanges(): boolean {
    return (
        gpExecSync(
            {
                command: `git status -u --porcelain=v1 2>/dev/null | wc -l`,
            },
            () => {
                throw new ExitFailedError(
                    `Failed to check current dir for unstaged changes.`
                );
            }
        )
            .toString()
            .trim() !== "0"
    );
}
