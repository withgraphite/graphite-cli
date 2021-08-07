import chalk from "chalk";
import { ValidationFailedError } from "../lib/errors";
import { currentBranchPrecondition } from "../lib/preconditions";
import { logInfo } from "../lib/utils";
import Branch from "../wrapper-classes/branch";
import { TScope } from "./scope";

export async function validate(scope: TScope): Promise<void> {
  const branch = currentBranchPrecondition();

  switch (scope) {
    case "UPSTACK":
      await validateBranchUpInclusive(branch);
      break;
    case "DOWNSTACK":
      await validateBranchDownInclusive(branch);
      break;
    case "FULLSTACK":
      await validateBranchDownInclusive(branch);
      await validateBranchUpInclusive(branch);
      break;
  }
  logInfo(`Current stack is valid`);
}

async function validateBranchDownInclusive(branch: Branch) {
  const metaParent = await branch.getParentFromMeta();
  const gitParents = branch.getParentsFromGit();
  const metaParentMatchesBranchWithSameHead =
    !!metaParent &&
    !!branch.branchesWithSameCommit().find((b) => b.name == metaParent.name);
  if (gitParents.length === 0 && !metaParent) {
    return;
  }
  if (
    gitParents.length === 0 &&
    metaParent &&
    !metaParentMatchesBranchWithSameHead
  ) {
    throw new ValidationFailedError(
      `(${branch.name}) has stack parent (${metaParent.name}), but no parent in the git graph.`
    );
  }
  if (gitParents.length === 1 && !metaParent) {
    throw new ValidationFailedError(
      `(${branch.name}) has git parent (${gitParents[0].name}), but no parent in the stack.`
    );
  }
  if (gitParents.length > 1) {
    throw new ValidationFailedError(
      `(${branch.name}) has more than one git parent (${gitParents.map(
        (b) => b.name
      )}).`
    );
  }
  if (!metaParent) {
    throw new ValidationFailedError("Unreachable");
  }
  if (
    !metaParentMatchesBranchWithSameHead &&
    gitParents[0].name !== metaParent.name
  ) {
    throw new ValidationFailedError(
      `(${branch.name}) has git parent (${gitParents[0].name}) but stack parent (${metaParent.name})`
    );
  }
  await validateBranchDownInclusive(metaParent);
  return;
}

async function validateBranchUpInclusive(branch: Branch) {
  const metaChildren = branch.getChildrenFromMeta();
  const gitChildren = branch.getChildrenFromGit();
  const hasGitChildren = gitChildren && gitChildren.length > 0;
  const hasMetaChildren = metaChildren.length > 0;
  if (!hasGitChildren && !hasMetaChildren) {
    // Assume to be a trunk branch and implicately valid.
    logInfo(`✅ ${chalk.green(`(${branch.name}) validated`)}`);
    return;
  }
  const gitChildrenMissingInMeta = gitChildren!.filter(
    (gitChild) => !metaChildren!.map((b) => b.name).includes(gitChild.name)
  );
  if (gitChildrenMissingInMeta.length > 0) {
    throw new ValidationFailedError(
      `Child branches of (${branch.name}) \n${gitChildrenMissingInMeta
        .map((b) => `-> (${b.name})`)
        .join("\n")}\n not found in the stack.`
    );
  }
  const gitChildrenAndEquals = gitChildren.concat(
    branch.branchesWithSameCommit()
  );
  const metaChildrenMissingInGit = metaChildren!.filter(
    (metaChild) => !gitChildrenAndEquals!.find((b) => b.name === metaChild.name)
  );
  if (metaChildrenMissingInGit.length > 0) {
    throw new ValidationFailedError(
      `Stack children:\n${metaChildrenMissingInGit
        .map((b) => `-> (${b.name})`)
        .join("\n")}\n not found as git child branchs of (${branch.name}).`
    );
  }
  logInfo(`✅ ${chalk.green(`(${branch.name}) validated`)}`);
  for (const child of metaChildren!) {
    await validateBranchUpInclusive(child);
  }
}
