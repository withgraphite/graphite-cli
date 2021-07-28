import chalk from "chalk";
import { log } from "../lib/log";
import { logErrorAndExit } from "../lib/utils";
import Branch from "../wrapper-classes/branch";

type scopeT = "UPSTACK" | "DOWNSTACK" | "FULLSTACK";
export async function validate(scope: scopeT, silent: boolean): Promise<void> {
  const branch = Branch.getCurrentBranch();
  if (branch === null) {
    logErrorAndExit("Not currently on a branch; no stack to validate.");
  }

  switch (scope) {
    case "UPSTACK":
      await validateBranchUpInclusive(branch, silent);
      break;
    case "DOWNSTACK":
      await validateBranchDownInclusive(branch, silent);
      break;
    case "FULLSTACK":
      await validateBranchDownInclusive(branch, silent);
      await validateBranchUpInclusive(branch, silent);
      break;
  }
  log(`Current stack is valid`, { silent: silent });
}

async function validateBranchDownInclusive(branch: Branch, silent: boolean) {
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
    throw new Error(
      `(${branch.name}) has stack parent (${metaParent.name}), but no parent in the git graph.`
    );
  }
  if (gitParents.length === 1 && !metaParent) {
    throw new Error(
      `(${branch.name}) has git parent (${gitParents[0].name}), but no parent in the stack.`
    );
  }
  if (gitParents.length > 1) {
    throw new Error(
      `(${branch.name}) has more than one git parent (${gitParents.map(
        (b) => b.name
      )}).`
    );
  }
  if (!metaParent) {
    throw new Error("Unreachable");
  }
  if (
    !metaParentMatchesBranchWithSameHead &&
    gitParents[0].name !== metaParent.name
  ) {
    throw new Error(
      `(${branch.name}) has git parent (${gitParents[0].name}) but stack parent (${metaParent.name})`
    );
  }
  await validateBranchDownInclusive(metaParent, silent);
  return;
}

async function validateBranchUpInclusive(branch: Branch, silent: boolean) {
  const metaChildren = await branch.getChildrenFromMeta();
  const gitChildren = branch.getChildrenFromGit();
  const hasGitChildren = gitChildren && gitChildren.length > 0;
  const hasMetaChildren = metaChildren.length > 0;
  if (!hasGitChildren && !hasMetaChildren) {
    // Assume to be a trunk branch and implicately valid.
    log(`✅ ${chalk.green(`(${branch.name}) validated`)}`, { silent });
    return;
  }
  const gitChildrenMissingInMeta = gitChildren!.filter(
    (gitChild) => !metaChildren!.map((b) => b.name).includes(gitChild.name)
  );
  if (gitChildrenMissingInMeta.length > 0) {
    throw new Error(
      `Child branches [${gitChildrenMissingInMeta
        .map((b) => `(${b.name})`)
        .join(", ")}] not found in the stack.`
    );
  }
  const gitChildrenAndEquals = gitChildren.concat(
    branch.branchesWithSameCommit()
  );
  const metaChildrenMissingInGit = metaChildren!.filter(
    (metaChild) => !gitChildrenAndEquals!.find((b) => b.name === metaChild.name)
  );
  if (metaChildrenMissingInGit.length > 0) {
    throw new Error(
      `Stack children [${metaChildrenMissingInGit
        .map((b) => `(${b.name})`)
        .join(", ")}] not found as git child branchs.`
    );
  }
  log(`✅ ${chalk.green(`(${branch.name}) validated`)}`, { silent });
  for (const child of metaChildren!) {
    await validateBranchUpInclusive(child, silent);
  }
}
