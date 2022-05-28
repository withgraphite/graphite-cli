import prompts from 'prompts';
import { TContext } from '../../lib/context';
import { KilledError } from '../../lib/errors';

export async function getPRDraftStatus(context: TContext): Promise<boolean> {
  if (!context.interactive) {
    return true;
  }
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
  return response.draft === 'draft';
}
