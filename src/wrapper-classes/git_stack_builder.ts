import { AbstractStackBuilder } from '.';
import { TContext } from '../lib/context/context';
import { MultiParentError, SiblingBranchError } from '../lib/errors';
import Branch from './branch';

export default class GitStackBuilder extends AbstractStackBuilder {
  protected getBranchParent(
    branch: Branch,
    context: TContext
  ): Branch | undefined {
    return branch.getParentsFromGit(context)[0];
  }

  protected getChildrenForBranch(branch: Branch, context: TContext): Branch[] {
    this.checkSiblingBranches(branch, context);
    return branch.getChildrenFromGit(context);
  }

  protected getParentForBranch(
    branch: Branch,
    context: TContext
  ): Branch | undefined {
    this.checkSiblingBranches(branch, context);
    const parents = branch.getParentsFromGit(context);
    if (parents.length > 1) {
      throw new MultiParentError(branch, parents);
    }
    return parents[0];
  }

  private checkSiblingBranches(branch: Branch, context: TContext): void {
    const siblingBranches = branch.branchesWithSameCommit(context);
    if (siblingBranches.length > 0) {
      throw new SiblingBranchError([branch].concat(siblingBranches), context);
    }
  }
}
