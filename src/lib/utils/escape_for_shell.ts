const SINGLE_QUOTE = "'";
const BACKSLASH = '\\';

export function q(source: string): string {
  return `${SINGLE_QUOTE}${source.replaceAll(
    SINGLE_QUOTE,
    `${SINGLE_QUOTE}${BACKSLASH}${SINGLE_QUOTE}${SINGLE_QUOTE}`
  )}${SINGLE_QUOTE}`;
}
