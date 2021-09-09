import { gpExecSync } from ".";
import { ExitFailedError } from "../errors";

enum ChangeType {
    uncommitted,
    unstaged
}

function gitStatus(changeType: ChangeType): boolean{
    const cmd = `git status ${changeType == ChangeType.unstaged ? '-u' : ''} --porcelain=v1 2>/dev/null | wc -l`

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
    return gitStatus(ChangeType.uncommitted)
}

export function unstagedChanges(): boolean {
    return gitStatus(ChangeType.unstaged)
}