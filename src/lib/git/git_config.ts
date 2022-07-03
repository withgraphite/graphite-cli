import { gpExecSync } from '../utils/exec_sync';

export function getGitEditor(): string | undefined {
  const editor = gpExecSync({
    command: `git config --global core.editor`,
  });
  return editor.length > 0 ? editor : undefined;
}

export function getGitPager(): string | undefined {
  const pager = gpExecSync({
    command: `git config --global core.pager`,
  });
  return pager.length > 0 ? pager : undefined;
}
