import { gpExecSync, logInternalErrorAndExit } from "./index";

export function checkoutBranch(branch: string): void {
  gpExecSync({ command: `git checkout -q "${branch}"` }, (_) => {
    logInternalErrorAndExit(`Failed to checkout branch (${branch})`);
  });
}
