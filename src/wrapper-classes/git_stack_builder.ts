import { TContext } from '../lib/context';
import { MultiParentError, SiblingBranchError } from '../lib/errors';
import { AbstractStackBuilder } from './abstract_stack_builder';
import { Branch } from './branch';

export class GitStackBuilder extends AbstractStackBuilder {
  protected getBranchParent(
    branch: Branch,
    context: TContext
  ): Branch | undefined {
    return branch.getParentsFromGit(context)[0];
  }

  protected getChildrenForBranch(branch: Branch, context: TContext): Branch[] {
    this.checkSiblingBranches(branch);
    return branch.getChildrenFromGit(context);
  }

  protected getParentForBranch(
    branch: Branch,
    context: TContext
  ): Branch | undefined {
    this.checkSiblingBranches(branch);
    const parents = branch.getParentsFromGit(context);
    if (parents.length > 1) {
      throw new MultiParentError(branch, parents);
    }
    return parents[0];
  }

  private checkSiblingBranches(branch: Branch): void {
    const siblingBranches = branch.branchesWithSameCommit();
    if (siblingBranches.length > 0) {
      throw new SiblingBranchError([branch].concat(siblingBranches));
    }
  }
}
