import { runCommand } from '../utils/run_command';

export function getGitEditor(): string | undefined {
  const editor = runCommand({
    command: `git`,
    args: [`config`, `--global`, `core.editor`],
    onError: 'ignore',
  });
  return editor.length > 0 ? editor : undefined;
}
