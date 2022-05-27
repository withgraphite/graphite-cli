import prompts from 'prompts';
import { TContext } from '../../lib/context';
import { KilledError } from '../../lib/errors';
import { Commit } from '../../wrapper-classes/commit';

export async function getPRTitle(
  args: {
    branchName: string;
    editPRFieldsInline: boolean;
  },
  context: TContext
): Promise<string> {
  const title = inferPRTitle(args.branchName, context);
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

export function inferPRTitle(branchName: string, context: TContext): string {
  const priorSubmitTitle = context.metaCache.getPrInfo(branchName)?.title;
  if (priorSubmitTitle !== undefined) {
    return priorSubmitTitle;
  }

  // Only infer the title from the commit if the branch has just 1 commit.
  const commits = context.metaCache.getAllCommits(branchName, 'SHA');
  const singleCommitSubject =
    commits.length === 1 ? new Commit(commits[0]).messageSubject() : undefined;

  return singleCommitSubject?.length
    ? singleCommitSubject
    : `Merge ${branchName} into ${context.metaCache.getParentPrecondition(
        branchName
      )}`;
}
