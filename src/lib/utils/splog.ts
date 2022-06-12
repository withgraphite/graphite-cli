import chalk from 'chalk';

export type TSplog = {
  newline: () => void;
  info: (msg: string) => void;
  debug: (msg: string) => void;
  error: (msg: string) => void;
  warn: (msg: string) => void;
  message: (msg: string) => void;
  tip: (msg: string) => void;
};

export function composeSplog(
  opts: {
    quiet?: boolean;
    outputDebugLogs?: boolean;
    tips?: boolean;
  } = {}
): TSplog {
  return {
    newline: opts.quiet ? () => void 0 : () => console.log(),
    info: opts.quiet ? () => void 0 : (s: string) => console.log(s),
    debug: opts.outputDebugLogs
      ? (s: string) =>
          console.log(
            chalk.dim(`${chalk.bold(`${new Date().toISOString()}:`)} ${s}`)
          )
      : () => void 0,
    error: (s: string) => console.log(chalk.redBright(`ERROR: ${s}`)),
    warn: (s: string) => console.log(chalk.yellow(`WARNING: ${s}`)),
    message: (s: string) => console.log(chalk.yellow(`${chalk.yellow(s)}\n\n`)),
    tip: (s: string) =>
      opts.tips && !opts.quiet
        ? console.log(
            chalk.gray(
              [
                '',
                `${chalk.bold('tip')}: ${s}`,
                chalk.italic('Feeling expert? `gt user tips --disable`'),
                '',
              ].join('\n')
            )
          )
        : () => void 0,
  };
}
