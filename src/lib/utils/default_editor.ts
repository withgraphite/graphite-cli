import chalk from 'chalk';
import prompts from 'prompts';
import { DEFAULT_GRAPHITE_EDITOR } from '../../commands/user-commands/editor';
import { userConfig } from '../../lib/config/user_config';
import { KilledError } from '../errors';
import { gpExecSync } from './exec_sync';
import { logInfo, logTip } from './splog';

/*
If the editor is not set, we attempt to infer it from environment variables $GIT_EDITOR or $EDITOR.
If those are unavailable, we want to prompt user to set them. If user doesn't want to set them, we default to nano.
 */

export async function getDefaultEditorOrPrompt(): Promise<string> {
  await setDefaultEditorOrPrompt();
  return userConfig.data.editor || DEFAULT_GRAPHITE_EDITOR;
}

export function setDefaultEditor(): void {
  const editor =
    gpExecSync({ command: `echo \${GIT_EDITOR:-$EDITOR}` }).toString().trim() ||
    DEFAULT_GRAPHITE_EDITOR;

  userConfig.update((data) => (data.editor = editor));
}

async function setDefaultEditorOrPrompt(): Promise<void> {
  if (!userConfig.data.editor) {
    // Check if any env variable is set.
    const systemEditor = gpExecSync({ command: `echo \${GIT_EDITOR:-$EDITOR}` })
      .toString()
      .trim();

    let editorPref: string;
    if (systemEditor.length) {
      editorPref = systemEditor;
      logTip(`Graphite will now use ${editorPref} as the default editor setting.
      We infer it from your environment variables ($GIT_EDITOR || $EDITOR).
      If you wish to change it, use \`gt user editor\` to change this in the future`);
    } else {
      logInfo(
        chalk.yellow(
          `We did not detect an editor preference in your settings. Do you wish to set it? (Graphite will use ${DEFAULT_GRAPHITE_EDITOR} as default.)`
        )
      );

      const yesOrNo = await prompts(
        {
          type: 'select',
          name: 'editorPrompt',
          message: 'Set default editor now?',
          choices: [
            { title: `Yes`, value: 'yes' },
            {
              title: `Skip and use Graphite default (${DEFAULT_GRAPHITE_EDITOR})`,
              value: 'no', // Should find a way to remember this selection so we are not repeatedly prompting
            },
          ],
        },
        {
          onCancel: () => {
            throw new KilledError();
          },
        }
      );

      if (yesOrNo.editorPrompt === 'yes') {
        const response = await prompts(
          {
            type: 'select',
            name: 'editor',
            message: 'Select an editor:', // Should this be a selection?
            choices: [
              { title: `vim`, value: 'vim' },
              { title: `emacs`, value: 'emacs' },
              { title: `nano`, value: 'nano' },
            ],
          },
          {
            onCancel: () => {
              throw new KilledError();
            },
          }
        );
        editorPref = response.editor;
      } else {
        editorPref = DEFAULT_GRAPHITE_EDITOR;
      }
    }

    userConfig.update((data) => (data.editor = editorPref));
    logInfo(chalk.yellow(`Graphite editor preference set to ${editorPref}.`));
  }
}
