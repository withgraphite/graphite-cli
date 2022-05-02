import prompts from 'prompts';
import { execStateConfig } from '../../lib/config/exec_state_config';
import { KilledError } from '../../lib/errors';

export async function getPRDraftStatus(): Promise<boolean> {
  if (!execStateConfig.interactive()) {
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
