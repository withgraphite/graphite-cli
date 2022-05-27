import fs from 'fs-extra';
import prompts from 'prompts';
import tmp from 'tmp';
import { TContext } from '../../lib/context';
import { KilledError } from '../../lib/errors';
import { getDefaultEditorOrPrompt } from '../../lib/utils/default_editor';
import { gpExecSync } from '../../lib/utils/exec_sync';
import { getPRTemplate } from '../../lib/utils/pr_templates';
import { Commit } from '../../wrapper-classes/commit';

export async function getPRBody(
  args: {
    branchName: string;
    editPRFieldsInline: boolean;
  },
  context: TContext
): Promise<string> {
  const body =
    inferPRBody(args.branchName, context) ?? (await getPRTemplate()) ?? '';
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
  branchName: string,
  context: TContext
): string | undefined {
  const priorSubmitBody = context.metaCache.getPrInfo(branchName)?.body;
  if (priorSubmitBody !== undefined) {
    return priorSubmitBody;
  }

  // Only infer the title from the commit if the branch has just 1 commit.
  const commits = context.metaCache.getAllCommits(branchName);
  const singleCommitBody =
    commits.length === 1 ? new Commit(commits[0]).messageBody() : undefined;

  return singleCommitBody?.length ? singleCommitBody : undefined;
}
