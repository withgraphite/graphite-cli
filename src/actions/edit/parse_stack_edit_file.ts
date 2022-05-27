import fs from 'fs-extra';

export function parseEditFile(filePath: string): string[] {
  return fs
    .readFileSync(filePath)
    .toString()
    .split('\n')
    .reverse()
    .map((line) =>
      line.substring(0, line.includes('#') ? line.indexOf('#') : line.length)
    )
    .filter((line) => line.length > 0);
}
