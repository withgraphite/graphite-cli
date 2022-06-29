import prompts from 'prompts';
import { TContext } from '../../lib/context';
import { KilledError } from '../../lib/errors';

export async function getPRTitle(
  args: {
    branchName: string;
    editPRFieldsInline?: boolean;
  },
  context: TContext
): Promise<string> {
  // First check if we have a saved title from a failed submit;
  // otherwise, use the subject of the oldest commit on the branch.
  const title =
    context.metaCache.getPrInfo(args.branchName)?.title ??
    context.metaCache.getAllCommits(args.branchName, 'SUBJECT').reverse()[0];

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
