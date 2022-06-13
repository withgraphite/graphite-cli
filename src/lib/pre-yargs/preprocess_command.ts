import { handleDeprecatedCommandNames } from './deprecated_commands';
import { passthrough } from './passthrough';

function splitShortcuts(command: string): string[] {
  if (
    typeof command === 'string' &&
    command.length == 2 &&
    !['ds', 'us'].includes(command) // block list two letter noun aliases
  ) {
    return [command[0], command[1]];
  }

  if (
    typeof command === 'string' &&
    command.length == 3 &&
    ['bco', 'bdl', 'btr', 'but', 'brn'].includes(command) // special case two-letter shortcuts
  ) {
    return [command[0], command.slice(1)];
  }

  if (
    typeof command === 'string' &&
    command.length == 3 &&
    ['ds', 'us'].includes(command.slice(0, 2)) // special case two-letter noun aliases
  ) {
    return [command.slice(0, 2), command[2]];
  }

  return [command];
}

export function getYargsInput(): string[] {
  passthrough(process.argv);
  const yargsInput = [
    ...splitShortcuts(process.argv[2]),
    ...process.argv.slice(3),
  ];
  handleDeprecatedCommandNames(yargsInput.slice(0, 2));
  return yargsInput;
}
