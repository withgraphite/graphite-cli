import { execSync } from "child_process";
import fs from "fs-extra";
import path from "path";
export function rebaseInProgress(opts?: { dir: string }): boolean {
  let rebaseDir = path.join(
    execSync(`git ${opts ? `-C "${opts.dir}"` : ""} rev-parse --git-dir`)
      .toString()
      .trim(),
    "rebase-merge"
  );
  if (opts) {
    rebaseDir = path.join(opts.dir, rebaseDir);
  }
  return fs.existsSync(rebaseDir);
}
