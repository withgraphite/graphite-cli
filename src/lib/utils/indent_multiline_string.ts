export function indentMultilineString(lines: string, indent: number): string {
  return lines
    .split('\n')
    .map((l) => ' '.repeat(indent) + l)
    .join('\n');
}
