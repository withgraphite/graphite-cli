import yargs from "yargs";
import { currentBranchPrecondition } from "../../lib/preconditions";
import { syncPRInfoForBranches } from "../../lib/sync/pr_info";
import { profile } from "../../lib/telemetry";
import { getTrunk, logInfo } from "../../lib/utils";

const args = {
  set: {
    type: "number",
    positional: true,
    demandOption: true,
    describe: "Override the PR number associated with the current branch.",
  },
} as const;
type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const aliases = [];
export const command = "pr";
export const description =
  "Get the current branch with the provided GitHub PR number for the current repo.";
export const builder = args;
export const handler = async (argv: argsT): Promise<void> => {
  return profile(argv, async () => {
    const branch = currentBranchPrecondition();
    if (argv.set) {
      // All branches associated with PRs must have a base; if there is no base
      // detected, we automatically defer to trunk.
      const base = branch.getParentFromMeta()?.name ?? getTrunk().name;

      branch.setPRInfo({
        number: argv.set,
        base: base,
      });

      await syncPRInfoForBranches([branch]);
    } else {
      logInfo(
        branch.getPRInfo()?.number.toString() ??
          "No PR associated with this branch"
      );
    }
  });
};
