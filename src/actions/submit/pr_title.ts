import prompts from 'prompts';
import { TContext } from '../../lib/context/context';
import { KilledError } from '../../lib/errors';
import { getSingleCommitOnBranch } from '../../lib/utils/single_commit';
import { Branch } from '../../wrapper-classes/branch';

export async function getPRTitle(
  args: {
    branch: Branch;
    editPRFieldsInline: boolean;
  },
  context: TContext
): Promise<string> {
  const title = inferPRTitle(args.branch, context);
  if (!args.editPRFieldsInline) {
    return title;
  }

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
  return response.title ?? title;
}

export function inferPRTitle(branch: Branch, context: TContext): string {
  const priorSubmitTitle = branch.getPRInfo()?.title;
  if (priorSubmitTitle !== undefined) {
    return priorSubmitTitle;
  }

  // Only infer the title from the commit if the branch has just 1 commit.
  const singleCommitSubject = getSingleCommitOnBranch(branch, context)
    ?.messageSubject()
    .trim();

  if (singleCommitSubject?.length) {
    return singleCommitSubject;
  }
  return `Merge ${branch.name} into ${branch.getParentFromMeta(context)?.name}`;
}
