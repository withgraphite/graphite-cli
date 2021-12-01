import { gpExecSync } from "./exec_sync";
import { logInfo } from "./splog";
import chalk from "chalk";
import prompts from "prompts";
import { KilledError } from "../errors";
import { userConfig } from "../../lib/config";

/*
If the editor is not set, we attempt to infer it from environment variables $GIT_EDITOR or $EDITOR.
If those are unavailable, we want to prompt user to set them. If user doesn't want to set them, we default to nano.
 */

export async function getDefaultEditorOrPrompt(): Promise<string>{
  let editor = userConfig.getEditor();
  if (!editor) {
    await setDefaultEditorOrPrompt();
    editor = userConfig.getEditor();
  }
  return editor || 'nano';
}

async function setDefaultEditorOrPrompt(): Promise<void> {
  if (!userConfig.getEditor()) {
    // Check if any env variable is set.
    const systemEditor = gpExecSync({ command: `echo \${GIT_EDITOR:-$EDITOR}` })
      .toString()
      .trim();

    let editorPref;
    if (systemEditor.length) {
      editorPref = systemEditor;
    } else {
      logInfo(
        chalk.yellow(
          "We did not detect an editor preference in your settings. Do you wish to set it? (Graphite will use `nano` as default.)"
        )
      );

      const yesOrNo = await prompts(
        {
          type: "select",
          name: "editorPrompt",
          message: "Set default editor now?",
          choices: [
            { title: `Yes`, value: "yes" },
            {
              title: `Skip and use Graphite default (nano)`,
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

      if (yesOrNo.editorPrompt === "yes") {
        const response = await prompts(
          {
            type: "select",
            name: "editor",
            message: "Select an editor:", // Should this be a selection?
            choices: [
              { title: `vim`, value: "vim" },
              { title: `emacs`, value: "emacs" },
              { title: `nano`, value: "nano" },
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
        editorPref = "nano";
      }
    }

    userConfig.setEditor(editorPref);
    logInfo(`Editor preference set to ${editorPref}.`);
  }
}
