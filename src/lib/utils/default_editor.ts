import { gpExecSync } from "./exec_sync";
import {logInfo} from "./splog";
import chalk from "chalk";
import prompts from "prompts";
import {KilledError} from "../errors";

export function getDefaultEditor(): string {
  const gitEditor = gpExecSync({ command: `echo \${GIT_EDITOR}` })
    .toString()
    .trim();
  if (gitEditor.length !== 0) {
    return gitEditor;
  }

  const editor = gpExecSync({ command: `echo \${EDITOR}` }).toString().trim();
  if (editor.length !== 0) {
    return editor;
  }

  return "nano";
}

export function isDefaultEditorSet(): boolean {
  let editor = gpExecSync({ command: `echo \${GIT_EDITOR}` })
      .toString()
      .trim();
  if (!editor.length) {
    editor = gpExecSync({command: `echo \${EDITOR}`}).toString().trim();
  }
  return editor.length !== 0;
}

export async function setDefaultEditorPrompt(): Promise<void> {

  if (!isDefaultEditorSet()) {
    logInfo(
        chalk.yellow(
            "Your default editor environment variables are not set. Do you wish to set it? (Graphite will use `nano` as default.)"
        )
    );
  }
  const yesOrNo = await prompts(
      {
        type: "select",
        name: "editorPrompt",
        message: "Set default editor now?",
        choices: [
          { title: `Yes (will set $EDITOR env variable).`, value: "yes" },
          {
            title: `Skip (just use nano as my default editor)`,
            value: "no", // Should find a way to remember this selection so we are not repeatedly prompting
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
    const editor = await prompts(
        {
          type: "text",
          name: "editor",
          message: "Enter your choice of editor (eg: vim, nano, emacs etc)", // Should this be a selection?
          initial: 'nano',
        },
        {
          onCancel: () => {
            throw new KilledError();
          },
        }
    );

    gpExecSync({command: `export EDITOR=${editor}`}); // Will it require permissions? Will it persist or does it need to be added to .zsh?
  }
}
