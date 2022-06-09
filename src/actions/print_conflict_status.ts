import chalk from 'chalk';
import { TContext } from '../lib/context';
import {
  getRebaseHead,
  getUnmergedFiles,
} from '../lib/git/merge_conflict_help';
import { logAction } from './log';

export function printConflictStatus(
  errMessage: string,
  context: TContext
): void {
  context.splog.info(chalk.red(errMessage));
  context.splog.newline();

  context.splog.info(chalk.yellow(`Unmerged files:`));
  context.splog.info(
    getUnmergedFiles()
      .map((line) => chalk.red(line))
      .join('\n')
  );
  context.splog.newline();

  context.splog.info(chalk.yellow(`You are here:`));
  try {
    logAction(
      { style: 'SHORT', reverse: false, branchName: getRebaseHead(), steps: 3 },
      context
    );
    context.splog.newline();
  } catch {
    // Silently fail if there is an issue getting the rebase head.
    // We don't want to be too dependent on git here, but this is the simplest way
    // to get the info we need.  There is likely a way for metaCache to do this.
  }

  context.splog.info(`To fix and continue your previous Graphite command:`);
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
