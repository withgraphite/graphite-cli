import chalk from 'chalk';
import { TContext } from '../lib/context';
import {
  getRebaseHead,
  getUnmergedFiles,
} from '../lib/git/merge_conflict_help';
import { logForConflictStatus } from './log';

export function printConflictStatus(
  errMessage: string,
  context: TContext
): void {
  context.splog.info(chalk.redBright(errMessage));
  context.splog.newline();

  context.splog.info(chalk.yellow(`Unmerged files:`));
  context.splog.info(
    getUnmergedFiles()
      .map((line) => chalk.redBright(line))
      .join('\n')
  );
  context.splog.newline();

  const rebaseHead = getRebaseHead();
  // this should never be undefined in this case, but we don't need to fail here
  if (rebaseHead) {
    context.splog.info(
      chalk.yellow(`You are here (resolving ${chalk.blueBright(rebaseHead)}):`)
    );
    logForConflictStatus(rebaseHead, context);
    context.splog.newline();
  }

  context.splog.info(
    chalk.yellow(`To fix and continue your previous Graphite command:`)
  );
  context.splog.info(`(1) resolve the listed merge conflicts`);
  context.splog.info(`(2) mark them as resolved with ${chalk.cyan(`gt add`)}`);
  context.splog.info(
    `(3) run ${chalk.cyan(
      `gt continue`
    )} to continue executing your previous Graphite command`
  );

  context.splog.tip(
    "It's safe to cancel the ongoing rebase with `gt rebase --abort`."
  );
}
