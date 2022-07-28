import { runGitCommand } from '../utils/run_command';

export function getGitEditor(): string | undefined {
  const editor = runGitCommand({
    args: [`config`, `--global`, `core.editor`],
    onError: 'ignore',
    resource: 'getGitEditor',
  });
  return editor.length > 0 ? editor : undefined;
}

export function getGitPager(): string | undefined {
  const editor = runGitCommand({
    args: [`config`, `--global`, `core.pager`],
    onError: 'ignore',
    resource: 'getGitEditor',
  });
  return editor.length > 0 ? editor : undefined;
}
