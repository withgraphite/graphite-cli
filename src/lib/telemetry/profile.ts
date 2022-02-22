// Why does an open source CLI include telemetry?
// We the creators want to understand how people are using the tool
// All metrics logged are listed plain to see, and are non blocking in case the server is unavailable.
import chalk from 'chalk';
import yargs from 'yargs';
import {
  fetchUpgradePromptInBackground,
  postTelemetryInBackground,
  registerSigintHandler,
} from '.';
import { version } from '../../../package.json';
import { init } from '../../actions/init';
import { execStateConfig } from '../config';
import { initContext } from '../context/context';
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
import { refreshPRInfoInBackground } from '../requests';
import {
  logError,
  logInfo,
  logNewline,
  logWarn,
  parseArgs,
  VALIDATION_HELPER_MESSAGE,
} from '../utils';
import { printGraphiteMergeConflictStatus } from '../utils/merge_conflict_help';
import { TContext } from './../context/context';
import { getUserEmail } from './context';
import tracer from './tracer';

export async function profile(
  args: yargs.Arguments,
  canonicalName: string,
  handler: (context: TContext) => Promise<void>
): Promise<void> {
  // Self heal repo config on all commands besides init:
  const parsedArgs = parseArgs(args);
  const start = Date.now();
  registerSigintHandler({
    commandName: parsedArgs.command,
    canonicalCommandName: canonicalName,
    startTime: start,
  });

  const context = initContext();

  fetchUpgradePromptInBackground(context);
  refreshPRInfoInBackground(context);

  if (
    parsedArgs.command !== 'repo init' &&
    !context.repoConfig.graphiteInitialized()
  ) {
    logInfo(`Graphite has not been initialized, attempting to setup now...`);
    logNewline();
    await init(context);
  }

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
        } catch (err: any) {
          switch (err.constructor) {
            case ExitFailedError:
              logError(err.message);
              throw err;
            case PreconditionsFailedError:
              logInfo(err.message);
              throw err;
            case RebaseConflictError:
              logNewline();
              logError(`Rebase conflict. ${err.message}`);
              logNewline();
              printGraphiteMergeConflictStatus();
              logNewline();
              logInfo(
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
              logError(`Validation: ${err.message}`);
              logInfo(VALIDATION_HELPER_MESSAGE);
              throw err;
            case ConfigError:
              logError(`Bad Config: ${err.message}`);
              throw err;
            case ExitCancelledError:
              logWarn(`Cancelled: ${err.message}`);
              return;
            case SiblingBranchError:
              logError(err.message);
              throw err;
            case MultiParentError:
              logError(err.message);
              throw err;
            case KilledError:
              return; // don't log output if user manually kills.
            default:
              logError(err.message);
              throw err;
          }
        }
      }
    );
  } catch (err: any) {
    const end = Date.now();
    if (execStateConfig.outputDebugLogs()) {
      logInfo(err);
      logInfo(err.stack);
    }
    postTelemetryInBackground({
      canonicalCommandName: canonicalName,
      commandName: parsedArgs.command,
      durationMiliSeconds: end - start,
      err: {
        errName: err.name,
        errMessage: err.message,
        errStack: err.stack || '',
      },
    });
    // eslint-disable-next-line no-restricted-syntax
    process.exit(1);
  }

  const end = Date.now();
  postTelemetryInBackground({
    canonicalCommandName: canonicalName,
    commandName: parsedArgs.command,
    durationMiliSeconds: end - start,
  });
}
