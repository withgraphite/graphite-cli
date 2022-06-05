// Why does an open source CLI include telemetry?
// We the creators want to understand how people are using the tool
// All metrics logged are listed plain to see, and are non blocking in case the server is unavailable.
import chalk from 'chalk';
import yargs from 'yargs';
import { version } from '../../package.json';
import { init } from '../actions/init';
import { initContext, TContext } from './context';
import {
  ExitFailedError,
  KilledError,
  PreconditionsFailedError,
  RebaseConflictError,
} from './errors';
import { getUnmergedFiles } from './git/merge_conflict_help';
import { TGlobalArguments } from './global_arguments';
import { refreshPRInfoInBackground } from './requests/fetch_pr_info';
import { getUserEmail } from './telemetry/context';
import { postTelemetryInBackground } from './telemetry/post_traces';
import { registerSigintHandler } from './telemetry/sigint_handler';
import { postSurveyResponsesInBackground } from './telemetry/survey/post_survey';
import { tracer } from './telemetry/tracer';
import { fetchUpgradePromptInBackground } from './telemetry/upgrade_prompt';
import { parseArgs } from './utils/parse_args';

export async function graphite(
  args: yargs.Arguments,
  canonicalName: string,
  handler: (context: TContext) => Promise<void>
): Promise<void> {
  const parsedArgs = parseArgs(args);
  const start = Date.now();
  registerSigintHandler({
    commandName: parsedArgs.command,
    canonicalCommandName: canonicalName,
    startTime: start,
  });

  const context = initContext({
    globalArguments: args as TGlobalArguments,
  });

  fetchUpgradePromptInBackground(context);
  refreshPRInfoInBackground(context);
  postSurveyResponsesInBackground(context);

  if (
    parsedArgs.command !== 'repo init' &&
    !context.repoConfig.graphiteInitialized()
  ) {
    context.splog.logInfo(
      `Graphite has not been initialized, attempting to setup now...`
    );
    context.splog.logNewline();
    await init(context);
  }

  let err;
  await tracer.span(
    {
      name: 'command',
      resource: parsedArgs.command,
      meta: {
        user: getUserEmail() || 'NotFound',
        version: version,
        args: parsedArgs.args,
        alias: parsedArgs.alias,
      },
    },
    async () => {
      try {
        await handler(context);
      } catch (e) {
        handleGraphiteError(e, context);
        context.splog.logDebug(e);
        context.splog.logDebug(e.stack);
        process.exitCode = 1;
        err = e;
      }
    }
  );

  context.metaCache.persist();

  const end = Date.now();
  postTelemetryInBackground({
    canonicalCommandName: canonicalName,
    commandName: parsedArgs.command,
    durationMiliSeconds: end - start,
    err,
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function handleGraphiteError(err: any, context: TContext): void {
  switch (err.constructor) {
    case KilledError:
      // pass
      return;
    case ExitFailedError:
      context.splog.logError(err.message);
      return;
    case PreconditionsFailedError:
      context.splog.logError(err.message);
      return;
    case RebaseConflictError:
      context.splog.logInfo(`${chalk.red(`Rebase Conflict`)}: ${err.message}`);
      context.splog.logNewline();
      context.splog.logInfo(chalk.yellow(`Unmerged files:`));
      context.splog.logInfo(
        getUnmergedFiles()
          .map((line) => chalk.red(line))
          .join('\n')
      );
      context.splog.logNewline();
      context.splog.logInfo(
        `To fix and continue your previous Graphite command:`
      );
      context.splog.logInfo(`(1) resolve the listed merge conflicts`);
      context.splog.logInfo(
        `(2) mark them as resolved with ${chalk.cyan(`gt add`)}`
      );
      context.splog.logInfo(
        `(3) run ${chalk.cyan(
          `gt continue`
        )} to continue executing your previous Graphite command`
      );
      return;
    default:
      context.splog.logError(err.message);
      return;
  }
}
