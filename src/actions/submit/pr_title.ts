import prompts from 'prompts';
import { KilledError } from '../../lib/errors';
import { getSingleCommitOnBranch } from '../../lib/utils';
import Branch from '../../wrapper-classes/branch';

export async function getPRTitle(args: {
  branch: Branch;
  editPRFieldsInline: boolean;
  dryRun: boolean;
}): Promise<string> {
  let title = inferPRTitle(args.branch);
  if (args.dryRun) {
    return title;
  }
  if (args.editPRFieldsInline) {
    const response = await prompts(
      {
        type: 'text',
        name: 'title',
        message: 'Title',
        initial: title,
      },
      {
        onCancel: () => {
          throw new KilledError();
        },
      }
    );
    title = response.title ?? title;
  }
  return title;
}

export function inferPRTitle(branch: Branch): string {
  const priorSubmitTitle = branch.getPriorSubmitTitle();
  if (priorSubmitTitle !== undefined) {
    return priorSubmitTitle;
  }

  // Only infer the title from the commit if the branch has just 1 commit.
  const singleCommit = getSingleCommitOnBranch(branch);
  const singleCommitSubject =
    singleCommit === null ? null : singleCommit.messageSubject().trim();

  if (singleCommitSubject !== null && singleCommitSubject.length > 0) {
    return singleCommitSubject;
  }
  return `Merge ${branch.name} into ${branch.getParentFromMeta()!.name}`;
}
