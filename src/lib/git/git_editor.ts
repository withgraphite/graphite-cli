import { runGitCommand } from '../utils/run_command';

export function getGitEditor(): string | undefined {
  const editor = runGitCommand({
    args: [`config`, `--global`, `core.editor`],
    onError: 'ignore',
    resource: 'getGitEditor',
  });
  return editor.length > 0 ? editor : undefined;
}
