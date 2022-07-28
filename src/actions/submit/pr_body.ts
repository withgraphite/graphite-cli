import fs from 'fs-extra';
import prompts from 'prompts';
import tmp from 'tmp';
import { TContext } from '../../lib/context';
import { KilledError } from '../../lib/errors';
import { getPRTemplate } from '../../lib/utils/pr_templates';

export async function getPRBody(
  args: {
    branchName: string;
    editPRFieldsInline: boolean;
  },
  context: TContext
): Promise<string> {
  const priorSubmitBody = context.metaCache.getPrInfo(args.branchName)?.body;
  const { inferredBody, skipDescription } = inferPRBody(
    { branchName: args.branchName, template: await getPRTemplate() },
    context
  );

  if (!args.editPRFieldsInline) {
    return priorSubmitBody ?? inferredBody;
  }

  const usePriorSubmitBody =
    !!priorSubmitBody &&
    (
      await prompts(
        {
          type: 'confirm',
          name: 'confirm',
          initial: true,
          message: 'Detected a PR body from an aborted submit, use it?',
        },
        {
          onCancel: () => {
            throw new KilledError();
          },
        }
      )
    ).confirm;

  const body = usePriorSubmitBody ? priorSubmitBody : inferredBody;

  const response = await prompts(
    {
      type: 'select',
      name: 'body',
      message: 'Body',
      choices: [
        {
          title: `Edit Body (using ${context.userConfig.getEditor()})`,
          value: 'edit',
        },
        {
          title: `Skip (${
            usePriorSubmitBody
              ? `use body from aborted submit`
              : skipDescription
          })`,
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

  return await editPRBody(body, context);
}

async function editPRBody(initial: string, context: TContext): Promise<string> {
  // We give the file the name EDIT_DESCRIPTION so certain editors treat it like a commit message
  // Because of this, we need to create a new directory for each PR body so as to avoid collision
  const dir = tmp.dirSync();
  const file = tmp.fileSync({
    dir: dir.name,
    name: 'EDIT_DESCRIPTION',
  });
  fs.writeFileSync(file.name, initial);

  try {
    context.userConfig.execEditor(file.name);
    const contents = fs.readFileSync(file.name).toString();
    return contents;
  } finally {
    // Remove the file and directory even if the user kills the submit
    file.removeCallback();
    dir.removeCallback();
  }
}

export function inferPRBody(
  { branchName, template = '' }: { branchName: string; template?: string },
  context: TContext
): { inferredBody: string; skipDescription: string } {
  if (!context.userConfig.data.submitIncludeCommitMessages) {
    return {
      inferredBody: template,
      skipDescription: template ? 'paste template' : 'leave empty',
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
    inferredBody: `${commitMessages}${
      commitMessages && template ? '\n\n' : ''
    }${template}`,

    skipDescription: `paste commit message${isSingleCommit ? '' : 's'}${
      template ? ' and template' : ''
    }`,
  };
}
