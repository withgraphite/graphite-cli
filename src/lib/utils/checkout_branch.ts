import { ExitFailedError } from "../errors";
import { gpExecSync } from "./index";

export function checkoutBranch(branch: string): void {
  gpExecSync({ command: `git checkout -q "${branch}"` }, (_) => {
    throw new ExitFailedError(`Failed to checkout branch (${branch})`);
  });
}
