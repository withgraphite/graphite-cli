import { gpExecSync } from ".";
import { ExitFailedError } from "../errors";

enum ChangeType {
    unCommitted,
    unStaged
}
function gitStatus(changeType: ChangeType): boolean{
    let cmd =  `git status --porcelain=v1 2>/dev/null | wc -l`
    if(changeType == ChangeType.unStaged) {
        cmd = `git status -u --porcelain=v1 2>/dev/null | wc -l`
    }
    return (
        gpExecSync(
            {
                command: cmd,
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


export function uncommittedChanges(): boolean {
    return gitStatus(ChangeType.unCommitted)
}

export function unStagedChanges(): boolean {
    return gitStatus(ChangeType.unStaged)
}