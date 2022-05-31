import fs from 'fs-extra';
import prompts from 'prompts';
import tmp from 'tmp';
import { TContext } from '../../lib/context';
import { KilledError } from '../../lib/errors';
import { getCommitMessage } from '../../lib/git/commit_message';
import { gpExecSync } from '../../lib/utils/exec_sync';
import { getPRTemplate } from '../../lib/utils/pr_templates';

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

  const editor = context.userConfig.getEditor();
  const response = await prompts(
    {
      type: 'select',
      name: 'body',
      message: 'Body',
      choices: [
        { title: `Edit Body (using ${editor})`, value: 'edit' },
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
    editor,
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
  const commits = context.metaCache.getAllCommits(branchName, 'SHA');
  const singleCommitBody =
    commits.length === 1 ? getCommitMessage(commits[0], 'BODY') : undefined;

  return singleCommitBody?.length ? singleCommitBody : undefined;
}
