import { ValidationFailedError } from "../lib/errors";
import { currentBranchPrecondition } from "../lib/preconditions";
import { logInfo } from "../lib/utils";
import {
  Branch,
  GitStackBuilder,
  MetaStackBuilder,
  Stack,
} from "../wrapper-classes";
import { TScope } from "./scope";

export function validate(scope: TScope): void {
  const branch = currentBranchPrecondition();

  switch (scope) {
    case "UPSTACK":
      validateBranchUpstackInclusive(branch);
      break;
    case "DOWNSTACK":
      validateBranchDownstackInclusive(branch);
      break;
    case "FULLSTACK":
      validateBranchFullstack(branch);
      break;
  }
  logInfo(`Current stack is valid`);
}

function validateBranchFullstack(branch: Branch): void {
  const metaStack = new MetaStackBuilder().fullStackFromBranch(branch);
  const gitStack = new GitStackBuilder().fullStackFromBranch(branch);

  compareStacks(metaStack, gitStack);
}

function validateBranchDownstackInclusive(branch: Branch): void {
  const metaStack =
    new MetaStackBuilder().upstackInclusiveFromBranchWithParents(branch);
  const gitStack = new GitStackBuilder().upstackInclusiveFromBranchWithParents(
    branch
  );

  metaStack.source.children = [];
  gitStack.source.children = [];

  compareStacks(metaStack, gitStack);
}

function validateBranchUpstackInclusive(branch: Branch): void {
  const metaStack =
    new MetaStackBuilder().upstackInclusiveFromBranchWithParents(branch);
  const gitStack = new GitStackBuilder().upstackInclusiveFromBranchWithParents(
    branch
  );

  metaStack.source.parent = undefined;
  gitStack.source.parent = undefined;

  compareStacks(metaStack, gitStack);
}

function compareStacks(metaStack: Stack, gitStack: Stack): void {
  if (!metaStack.equals(gitStack)) {
    throw new ValidationFailedError(
      [
        `Graphite stack does not match git-derived stack\n`,
        "\nGraphite Stack:",
        metaStack.toString(),
        "\nGit Stack:",
        gitStack.toString(),
      ].join("\n")
    );
  }
}
