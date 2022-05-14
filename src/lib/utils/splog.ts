import chalk from 'chalk';

export type TSplog = {
  logNewline: () => void;
  logInfo: (msg: string) => void;
  logDebug: (msg: string) => void;
  logError: (msg: string) => void;
  logWarn: (msg: string) => void;
  logMessageFromGraphite: (msg: string) => void;
  logTip: (msg: string) => void;
};

export function composeSplog(opts: {
  quiet?: boolean;
  outputDebugLogs?: boolean;
  tips?: boolean;
}): TSplog {
  return {
    logNewline: opts.quiet ? () => void 0 : () => console.log('\n'),
    logInfo: opts.quiet ? () => void 0 : (s: string) => console.log(s),
    logDebug: opts.outputDebugLogs
      ? (s: string) => console.log(`DEBUG: ${s}`)
      : () => void 0,
    logError: (s: string) => console.log(chalk.redBright(`ERROR: ${s}`)),
    logWarn: (s: string) => console.log(chalk.yellow(`WARNING: ${s}`)),
    logMessageFromGraphite: (s: string) =>
      console.log(chalk.yellow(`${chalk.yellow(s)}\n\n`)),
    logTip: (s: string) =>
      opts.tips && !opts.quiet
        ? console.log(
            chalk.gray(
              [
                '',
                `${chalk.bold('tip')}: ${s}`,
                chalk.italic('Feeling expert? "gt user tips --disable"'),
              ].join('\n')
            )
          )
        : () => void 0,
  };
}
