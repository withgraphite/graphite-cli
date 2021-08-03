import { execSync } from "child_process";
export function getNumBranches(): number | undefined {
  try {
    return parseInt(execSync("git branch | wc -l").toString().trim());
  } catch {
    return undefined;
  }
}
export function getNumCommitObjects(): number | undefined {
  try {
    return parseInt(execSync("git rev-list --all | wc -l").toString().trim());
  } catch {
    return undefined;
  }
}
