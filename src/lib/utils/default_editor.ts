import { gpExecSync } from "./exec_sync";
import { logInfo } from "./splog";
import chalk from "chalk";
import prompts from "prompts";
import { KilledError } from "../errors";
import { userConfig } from "../../lib/config";

// Find one entry point and set user config editor to the value of GIT_EDITOR or EDITOR if either is set. If neither is set,
// prompt the user to set it. If they choose to not set it then set it to nano.
export function getDefaultEditor(): string {
  let editor = userConfig.getEditor();
  if (!editor) {
    editor = "nano"; //This should prompt instead
  }
  return editor;
}

export async function setDefaultEditorPrompt(): Promise<void> {
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

      if (yesOrNo.editorPrompt === "yes") {
        const response = await prompts(
          {
            type: "text",
            name: "editor",
            message: "Enter your choice of editor (eg: vim, nano, emacs etc)", // Should this be a selection?
            initial: "nano",
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
  }
}
