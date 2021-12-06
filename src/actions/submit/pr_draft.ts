import prompts from 'prompts';
import { KilledError } from '../../lib/errors';

export async function getPRDraftStatus(args: {
  createNewPRsAsDraft: boolean | undefined;
}): Promise<boolean> {
  let draft: boolean;
  if (args.createNewPRsAsDraft === undefined) {
    const response = await prompts(
      {
        type: 'select',
        name: 'draft',
        message: 'Submit',
        choices: [
          { title: 'Publish Pull Request', value: 'publish' },
          { title: 'Create Draft Pull Request', value: 'draft' },
        ],
      },
      {
        onCancel: () => {
          throw new KilledError();
        },
      }
    );
    draft = response.draft === 'draft' ? true : false;
  } else {
    draft = args.createNewPRsAsDraft;
  }
  return draft;
}
