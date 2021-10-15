import chalk from "chalk";
import fs from "fs-extra";
import path from "path";
import { logDebug } from "../utils";
import { getRepoRootPath } from "./repo_root_path";

const CONFIG_NAME = ".graphite_merge_conflict";
const CURRENT_REPO_CONFIG_PATH = path.join(getRepoRootPath(), CONFIG_NAME);

/**
 * After Graphite is interrupted by a merge conflict, upon continuing, there
 * are 2 main things we need to do.
 *
 * 1) Complete the original rebase operation.
 * 2) Perform any needed follow-up actions that were supposed to occur after
 *    the rebase in the original callstack.
 *
 * The below object helps keep track of these items and persist them across
 * invocations of the CLI.
 */
export type MergeConflictCallstackT = {
  interruptedRebase: InterruptedRebaseT;
  rebaseContinuations: RebaseContinuationsT;
};

type InterruptedRebaseT = {
  op: "STACK_FIX";
  sourceBranch: string;
};

type RebaseContinuationMethodT = "STACK_FIX_CONTINUATION";

type RebaseContinuationsT = {
  method: RebaseContinuationMethodT;
  args: any;
  parent: RebaseContinuationsT;
} | null;

export function persistMergeConflictCallstack(
  callstack: MergeConflictCallstackT
): void {
  fs.writeFileSync(
    CURRENT_REPO_CONFIG_PATH,
    JSON.stringify(callstack, null, 2)
  );
}

export function getPersistedMergeConflictCallstack(): MergeConflictCallstackT | null {
  if (fs.existsSync(CURRENT_REPO_CONFIG_PATH)) {
    const repoConfigRaw = fs.readFileSync(CURRENT_REPO_CONFIG_PATH);
    try {
      return JSON.parse(
        repoConfigRaw.toString().trim()
      ) as MergeConflictCallstackT;
    } catch (e) {
      logDebug(chalk.yellow(`Warning: Malformed ${CURRENT_REPO_CONFIG_PATH}`));
    }
  }
  return null;
}

export function clearPersistedMergeConflictCallstack(): void {
  fs.unlinkSync(CURRENT_REPO_CONFIG_PATH);
}
