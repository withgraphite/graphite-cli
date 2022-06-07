// Why does an open source CLI include telemetry?
// We the creators want to understand how people are using the tool
// All metrics logged are listed plain to see, and are non blocking in case the server is unavailable.
import chalk from 'chalk';
import yargs from 'yargs';
import { version } from '../../../package.json';
import { init } from '../../actions/init';
import { initContext, TContext } from '../context';
import {
  ConfigError,
  ExitCancelledError,
  ExitFailedError,
  KilledError,
  MultiParentError,
  PreconditionsFailedError,
  RebaseConflictError,
  SiblingBranchError,
  ValidationFailedError,
} from '../errors';
import { printStatus } from '../git/merge_conflict_help';
import { TGlobalArguments } from '../global_arguments';
import { refreshPRInfoInBackground } from '../requests/fetch_pr_info';
import { parseArgs } from '../utils/parse_args';
import { VALIDATION_HELPER_MESSAGE } from '../utils/validation_helper_message';
import { getUserEmail } from './context';
import { postTelemetryInBackground } from './post_traces';
import { registerSigintHandler } from './sigint_handler';
import { postSurveyResponsesInBackground } from './survey/post_survey';
import { tracer } from './tracer';
import { fetchUpgradePromptInBackground } from './upgrade_prompt';

export async function profile(
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

  let err = undefined;

  try {
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
        } catch (err) {
          switch (err.constructor) {
            case ExitFailedError:
              context.splog.logError(err.message);
              throw err;
            case PreconditionsFailedError:
              context.splog.logInfo(err.message);
              throw err;
            case RebaseConflictError:
              context.splog.logNewline();
              context.splog.logError(`Rebase conflict. ${err.message}`);
              context.splog.logNewline();
              printStatus();
              context.splog.logNewline();
              context.splog.logInfo(
                [
                  `To fix and continue your previous Graphite command:`,
                  `(1) resolve the listed merge conflicts`,
                  `(2) mark them as resolved with "git add"`,
                  `(3) run "gt continue" to continue executing your previous Graphite command`,
                ]
                  .map((line) => chalk.yellow(line))
                  .join('\n')
              );
              return;
            case ValidationFailedError:
              context.splog.logError(`Validation: ${err.message}`);
              context.splog.logInfo(VALIDATION_HELPER_MESSAGE);
              throw err;
            case ConfigError:
              context.splog.logError(`Bad Config: ${err.message}`);
              throw err;
            case ExitCancelledError:
              context.splog.logWarn(`Cancelled: ${err.message}`);
              return;
            case SiblingBranchError:
              context.splog.logError(err.message);
              throw err;
            case MultiParentError:
              context.splog.logError(err.message);
              throw err;
            case KilledError:
              return; // don't log output if user manually kills.
            default:
              context.splog.logError(err.message);
              throw err;
          }
        }
      }
    );
  } catch (e) {
    err = e;
  }

  const end = Date.now();
  postTelemetryInBackground({
    canonicalCommandName: canonicalName,
    commandName: parsedArgs.command,
    durationMiliSeconds: end - start,
    err,
  });

  if (err) {
    context.splog.logDebug(err);
    context.splog.logDebug(err.stack);

    // eslint-disable-next-line no-restricted-syntax
    process.exit(1);
  }
}
