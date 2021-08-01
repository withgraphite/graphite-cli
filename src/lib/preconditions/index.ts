import Branch from "../../wrapper-classes/branch";
import { PreconditionsFailedError } from "../errors";

function currentBranchPrecondition(): Branch {
  const branch = Branch.getCurrentBranch();
  if (!branch) {
    throw new PreconditionsFailedError(
      `Cannot find current branch. Please ensure you're running this command atop a checked-out branch.`
    );
  }
  return branch;
}

export { currentBranchPrecondition };
