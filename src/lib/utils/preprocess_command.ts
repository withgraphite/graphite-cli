function splitShortcuts(command: string): string[] {
  if (
    typeof command === 'string' &&
    command.length == 2 &&
    !['ds', 'us'].includes(command) // block list two letter noun aliases
  ) {
    return [command[0], command[1]];
  } else if (
    typeof command === 'string' &&
    command.length == 3 &&
    ['bco', 'bdl'].includes(command) // special case two-letter shortcuts
  ) {
    return [command[0], command.slice(1)];
  }
  return [command];
}

export function preprocessCommand(): void {
  process.argv = [
    ...process.argv.slice(0, 2),
    ...splitShortcuts(process.argv[2]),
    ...process.argv.slice(3),
  ];
}
