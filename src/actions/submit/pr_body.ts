import fs from 'fs-extra';
import prompts from 'prompts';
import tmp from 'tmp';
import { TContext } from '../../lib/context';
import { KilledError } from '../../lib/errors';
import { gpExecSync } from '../../lib/utils/exec_sync';
import { getPRTemplate } from '../../lib/utils/pr_templates';

export async function getPRBody(
  args: {
    branchName: string;
    editPRFieldsInline: boolean;
  },
  context: TContext
): Promise<string> {
  const { body, skipDescription } = inferPRBody(
    { branchName: args.branchName, template: await getPRTemplate() },
    context
  );
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
          title: `Skip (${skipDescription})`,
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
  { branchName, template = '' }: { branchName: string; template?: string },
  context: TContext
): { body: string; skipDescription: string } {
  const priorSubmitBody = context.metaCache.getPrInfo(branchName)?.body;
  if (priorSubmitBody !== undefined) {
    return {
      body: priorSubmitBody,
      skipDescription: 'use body from aborted submit',
    };
  }

  const messages = context.metaCache
    .getAllCommits(branchName, 'MESSAGE')
    .reverse();
  const isSingleCommit = messages.length === 1;
  const commitMessages = isSingleCommit
    ? messages[0].split('\n').slice(1).join('\n').trim()
    : messages.join('\n\n');

  return {
    body: `${commitMessages}${
      commitMessages && template ? '\n\n' : ''
    }${template}`,

    skipDescription: `paste commit message${isSingleCommit ? '' : 's'}${
      template ? ' and template' : ''
    }`,
  };
}
