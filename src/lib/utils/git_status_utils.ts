import { gpExecSync } from ".";
import { ExitFailedError } from "../errors";

function isPresent(cmd: string): boolean{
 return (
        gpExecSync(
            {
                command: cmd,
            },
            () => {
                throw new ExitFailedError(
                    `Failed to check current dir for untracked/uncommitted changes.`
                );
            }
        )
            .toString()
            .trim() !== "0"
    );
}


export function uncommittedChanges(): boolean {
    return isPresent(`git status -u --porcelain=v1 2>/dev/null | wc -l`)
}

export function unstagedChanges(): boolean {
    return isPresent(`git ls-files --others --exclude-standard | wc -l`)
}

export function trackedUncommittedChanges(): boolean {
    return isPresent(`git status -uno --porcelain=v1 2>/dev/null | wc -l`)
}