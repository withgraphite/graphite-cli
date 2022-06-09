// Why does an open source CLI include telemetry?
// We the creators want to understand how people are using the tool
// All metrics logged are listed plain to see, and are non blocking in case the server is unavailable.
import chalk from 'chalk';
import yargs from 'yargs';
import { version } from '../../package.json';
import { init } from '../actions/init';
import { refreshPRInfoInBackground } from '../background_tasks/fetch_pr_info';
import { postSurveyResponsesInBackground } from '../background_tasks/post_survey';
import { fetchUpgradePromptInBackground } from '../background_tasks/upgrade_prompt';
import {
  initContext,
  initContextLite,
  TContext,
  TContextLite,
} from './context';
import { getCacheLock, TCacheLock } from './engine/cache_lock';
import {
  BadTrunkOperationError,
  ConcurrentExecutionError,
  ExitFailedError,
  KilledError,
  PreconditionsFailedError,
  RebaseConflictError,
  UntrackedBranchError,
} from './errors';
import { getUnmergedFiles } from './git/merge_conflict_help';
import { TGlobalArguments } from './global_arguments';
import { getUserEmail } from './telemetry/context';
import { postTelemetryInBackground } from './telemetry/post_traces';
import { registerSigintHandler } from './telemetry/sigint_handler';
import { tracer } from './telemetry/tracer';
import { parseArgs } from './utils/parse_args';

export async function graphite(
  args: yargs.Arguments & TGlobalArguments,
  canonicalName: string,
  handler: (context: TContext) => Promise<void>
): Promise<void> {
  return graphiteInternal(args, canonicalName, {
    repo: true as const,
    run: handler,
  });
}

export async function graphiteLite(
  args: yargs.Arguments & TGlobalArguments,
  canonicalName: string,
  handler: (context: TContextLite) => Promise<void>
): Promise<void> {
  return graphiteInternal(args, canonicalName, {
    repo: false as const,
    run: handler,
  });
}

async function graphiteInternal(
  args: yargs.Arguments & TGlobalArguments,
  canonicalName: string,
  handler: TGraphiteCommandHandler
): Promise<void> {
  const parsedArgs = parseArgs(args);

  const start = Date.now();
  const handlerWithCacheLock: TGraphiteCommandHandlerWithCacheLock =
    handler.repo ? { ...handler, cacheLock: getCacheLock() } : handler;

  registerSigintHandler({
    commandName: parsedArgs.command,
    canonicalCommandName: canonicalName,
    startTime: start,
    cacheLock: handlerWithCacheLock.cacheLock,
  });

  const err = await tracer.span(
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
    () => {
      const contextLite = initContextLite(args);
      return graphiteHelper(
        canonicalName,
        args,
        contextLite,
        handlerWithCacheLock
      );
    }
  );
  const end = Date.now();
  postTelemetryInBackground({
    canonicalCommandName: canonicalName,
    commandName: parsedArgs.command,
    durationMiliSeconds: end - start,
    err,
  });
}

// TODO check with Greg about whether we still need all the OldTelemetry stuff?
// Then we can simplify this function and signature a lot
// eslint-disable-next-line max-params
async function graphiteHelper(
  canonicalName: string,
  args: TGlobalArguments,
  contextLite: TContextLite,
  handler: TGraphiteCommandHandlerWithCacheLock
): Promise<Error | undefined> {
  const context = handler.repo
    ? { ...handler, ...initContext(contextLite, args) }
    : { ...handler, ...contextLite };

  const err = await (async (): Promise<Error | undefined> => {
    try {
      fetchUpgradePromptInBackground(context);
      postSurveyResponsesInBackground(context);
      if (!context.repo) {
        await context.run(context);
        return undefined;
      }

      refreshPRInfoInBackground(context);

      if (
        canonicalName !== 'repo init' &&
        !context.repoConfig.graphiteInitialized()
      ) {
        context.splog.info(
          `Graphite has not been initialized, attempting to setup now...`
        );
        context.splog.newline();
        await init(context);
      }

      await context.run(context);
      return undefined;
    } catch (err) {
      handleGraphiteError(err, context);
      context.splog.debug(err);
      context.splog.debug(err.stack);
      // print errors when debugging tests
      if (process.env.DEBUG) {
        process.stdout.write(err.stack.toString());
      }
      process.exitCode = 1;
      return err;
    }
  })();

  if (!context.repo) {
    return err;
  }

  try {
    context.metaCache.persist();
  } catch (persistError) {
    context.metaCache.clear();
    context.splog.debug(`Failed to persist Graphite cache`);
  }

  context.cacheLock.release();
  return err;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function handleGraphiteError(err: any, context: TContextLite): void {
  switch (err.constructor) {
    case KilledError:
      // pass
      return;

    case RebaseConflictError:
      context.splog.info(`${chalk.red(`Rebase Conflict`)}: ${err.message}`);
      context.splog.newline();
      context.splog.info(chalk.yellow(`Unmerged files:`));
      context.splog.info(
        getUnmergedFiles()
          .map((line) => chalk.red(line))
          .join('\n')
      );
      context.splog.newline();
      context.splog.info(`To fix and continue your previous Graphite command:`);
      context.splog.info(`(1) resolve the listed merge conflicts`);
      context.splog.info(
        `(2) mark them as resolved with ${chalk.cyan(`gt add`)}`
      );
      context.splog.info(
        `(3) run ${chalk.cyan(
          `gt continue`
        )} to continue executing your previous Graphite command`
      );
      context.splog.tip(
        "It's safe to cancel the ongoing rebase with `gt rebase --abort`."
      );

      return;

    case UntrackedBranchError:
      context.splog.tip('You can track a branch with `gt branch track`.');
      context.splog.error(err.message);
      return;

    case BadTrunkOperationError:
    case ExitFailedError:
    case ConcurrentExecutionError:
    case PreconditionsFailedError:
    default:
      context.splog.error(err.message);
      return;
  }
}

// typescript is fun!
type TGraphiteCommandHandler =
  | { repo: true; run: (context: TContext) => Promise<void> }
  | {
      repo: false;
      run: (contextLite: TContextLite) => Promise<void>;
    };
type TGraphiteCommandHandlerWithCacheLock =
  | {
      repo: true;
      run: (context: TContext) => Promise<void>;
      cacheLock: TCacheLock;
    }
  | {
      repo: false;
      run: (contextLite: TContextLite) => Promise<void>;
      cacheLock?: undefined;
    };
