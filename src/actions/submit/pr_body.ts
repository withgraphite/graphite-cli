import { execSync } from 'child_process';
import fs from 'fs-extra';
import prompts from 'prompts';
import tmp from 'tmp';
import { TContext } from '../../lib/context/context';
import { KilledError } from '../../lib/errors';
import { getSingleCommitOnBranch } from '../../lib/utils';
import { getDefaultEditorOrPrompt } from '../../lib/utils/default_editor';
import { getPRTemplate } from '../../lib/utils/pr_templates';
import { Branch } from '../../wrapper-classes/branch';

export async function getPRBody(
  args: {
    branch: Branch;
    editPRFieldsInline: boolean;
  },
  context: TContext
): Promise<string> {
  const template = await getPRTemplate();
  const inferredBodyFromCommit = inferPRBody(args.branch, context);
  let body =
    inferredBodyFromCommit !== null ? inferredBodyFromCommit : template;
  const hasPRTemplate = body !== undefined;
  if (args.editPRFieldsInline) {
    const defaultEditor = await getDefaultEditorOrPrompt(context);
    const response = await prompts(
      {
        type: 'select',
        name: 'body',
        message: 'Body',
        choices: [
          { title: `Edit Body (using ${defaultEditor})`, value: 'edit' },
          {
            title: `Skip${hasPRTemplate ? ` (just paste template)` : ''}`,
            value: 'skip',
          },
        ],
      },
      {
        onCancel: () => {
          throw new KilledError();
        },
      }
    );
    if (response.body === 'edit') {
      body = await editPRBody({
        initial: body ?? '',
        editor: defaultEditor,
      });
    }
  }
  return body ?? '';
}

async function editPRBody(args: {
  initial: string;
  editor: string;
}): Promise<string> {
  const file = tmp.fileSync();
  fs.writeFileSync(file.name, args.initial);
  execSync(`${args.editor} ${file.name}`, { stdio: 'inherit' });
  const contents = fs.readFileSync(file.name).toString();
  file.removeCallback();
  return contents;
}

export function inferPRBody(branch: Branch, context: TContext): string | null {
  const priorSubmitBody = branch.getPriorSubmitBody();
  if (priorSubmitBody !== undefined) {
    return priorSubmitBody;
  }

  // Only infer the title from the commit if the branch has just 1 commit.
  const singleCommit = getSingleCommitOnBranch(branch, context);
  const singleCommitBody =
    singleCommit === null ? null : singleCommit.messageBody().trim();

  if (singleCommitBody !== null && singleCommitBody.length > 0) {
    return singleCommitBody;
  }
  return null;
}
