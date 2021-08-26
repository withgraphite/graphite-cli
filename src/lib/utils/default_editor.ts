import { gpExecSync } from "./exec_sync";

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
