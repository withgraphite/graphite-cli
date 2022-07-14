import { gpExecSync } from '../utils/exec_sync';

export function getGitEditor(): string | undefined {
  const editor = gpExecSync({
    command: `git config --global core.editor`,
    onError: 'ignore',
  });
  return editor.length > 0 ? editor : undefined;
}
