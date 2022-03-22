import { logWarn } from './splog';
export function signpostDeprecatedCommands(command: string[]): void {
  if (command.length === 0) return;
  switch (command[0]) {
    case 'stacks':
      logWarn(
        [
          'The command "stacks" has been deprecated.',
          'Please use "log short" aka "ls" instead to see your stacks, or "branch checkout" aka "bco" for an interactive checkout.',
          'Thank you for bearing with us while we rapidly iterate!',
        ].join('\n')
      );
      // eslint-disable-next-line no-restricted-syntax
      process.exit(1);
  }
}
