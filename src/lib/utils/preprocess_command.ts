function splitShortcuts(command: string): string[] {
  if (typeof command === "string" && command.length == 2) {
    return [command[0], command[1]];
  } else if (
    typeof command === "string" &&
    command.length == 3 &&
    command == "bco" // special case this two-letter shortcut for checkout
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
