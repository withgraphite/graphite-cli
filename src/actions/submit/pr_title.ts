import prompts from 'prompts';
import { TContext } from '../../lib/context/context';
import { KilledError } from '../../lib/errors';
import { getSingleCommitOnBranch } from '../../lib/utils';
import Branch from '../../wrapper-classes/branch';

export async function getPRTitle(
  args: {
    branch: Branch;
    editPRFieldsInline: boolean;
  },
  context: TContext
): Promise<string> {
  let title = inferPRTitle(args.branch, context);
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

export function inferPRTitle(branch: Branch, context: TContext): string {
  const priorSubmitTitle = branch.getPriorSubmitTitle();
  if (priorSubmitTitle !== undefined) {
    return priorSubmitTitle;
  }

  // Only infer the title from the commit if the branch has just 1 commit.
  const singleCommit = getSingleCommitOnBranch(branch, context);
  const singleCommitSubject =
    singleCommit === null ? null : singleCommit.messageSubject().trim();

  if (singleCommitSubject !== null && singleCommitSubject.length > 0) {
    return singleCommitSubject;
  }
  return `Merge ${branch.name} into ${branch.getParentFromMeta(context)!.name}`;
}
