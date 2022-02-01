import prompts from 'prompts';
import { KilledError } from '../../lib/errors';

export async function getReviewers(args: {
  fetchReviewers: boolean;
}): Promise<undefined | string[]> {
  if (!args.fetchReviewers) {
    return undefined;
  }
  const response = await prompts(
    {
      type: 'list',
      name: 'reviewers',
      message: 'Reviewers (comma seperated github usernames)',
      seperator: ',',
    },
    {
      onCancel: () => {
        throw new KilledError();
      },
    }
  );
  return response.reviewers;
}
