import fs from 'fs-extra';
import prompts from 'prompts';
import tmp from 'tmp';
import { TContext } from '../../lib/context';
import { KilledError } from '../../lib/errors';
import { getDefaultEditorOrPrompt } from '../../lib/utils/default_editor';
import { gpExecSync } from '../../lib/utils/exec_sync';
import { getPRTemplate } from '../../lib/utils/pr_templates';
import { getSingleCommitOnBranch } from '../../lib/utils/single_commit';
import { Branch } from '../../wrapper-classes/branch';

export async function getPRBody(
  args: {
    branch: Branch;
    editPRFieldsInline: boolean;
  },
  context: TContext
): Promise<string> {
  const body =
    inferPRBody(args.branch, context) ?? (await getPRTemplate()) ?? '';
  if (!args.editPRFieldsInline) {
    return body;
  }

  const defaultEditor = await getDefaultEditorOrPrompt(context);
  const response = await prompts(
    {
      type: 'select',
      name: 'body',
      message: 'Body',
      choices: [
        { title: `Edit Body (using ${defaultEditor})`, value: 'edit' },
        {
          title: `Skip${body ? ` (just paste template)` : ''}`,
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
  if (response.body === 'skip') {
    return body;
  }

  return await editPRBody({
    initial: body,
    editor: defaultEditor,
  });
}

async function editPRBody(args: {
  initial: string;
  editor: string;
}): Promise<string> {
  const file = tmp.fileSync();
  fs.writeFileSync(file.name, args.initial);
  gpExecSync({
    command: `${args.editor} ${file.name}`,
    options: { stdio: 'inherit' },
  });
  const contents = fs.readFileSync(file.name).toString();
  file.removeCallback();
  return contents;
}

export function inferPRBody(
  branch: Branch,
  context: TContext
): string | undefined {
  const priorSubmitBody = branch.getPRInfo()?.body;
  if (priorSubmitBody !== undefined) {
    return priorSubmitBody;
  }

  // Only infer the title from the commit if the branch has just 1 commit.
  const singleCommitBody = getSingleCommitOnBranch(branch, context)
    ?.messageBody()
    .trim();

  if (singleCommitBody?.length) {
    return singleCommitBody;
  }
  return undefined;
}
