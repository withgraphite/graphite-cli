const SINGLE_QUOTE_REGEX = /'/g;
const SINGLE_QUOTE = "'";
const BACKSLASH = '\\';

export function q(source: string): string {
  return `${SINGLE_QUOTE}${source.replace(
    SINGLE_QUOTE_REGEX,
    `${SINGLE_QUOTE}${BACKSLASH}${SINGLE_QUOTE}${SINGLE_QUOTE}`
  )}${SINGLE_QUOTE}`;
}
