// Why does an open source CLI include telemetry?
// We the creators want to understand how people are using the tool
// All metrics logged are listed plain to see, and are non blocking in case the server is unavailable.
import yargs from 'yargs';
import { version } from '../../package.json';
import { init } from '../actions/init';
import { refreshPRInfoInBackground } from '../background_tasks/fetch_pr_info';
import { postSurveyResponsesInBackground } from '../background_tasks/post_survey';
import { postTelemetryInBackground } from '../background_tasks/post_traces';
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
  CommandFailedError,
  ConcurrentExecutionError,
  ExitFailedError,
  KilledError,
  PreconditionsFailedError,
  RebaseConflictError,
  UntrackedBranchError,
} from './errors';
import { getUserEmail } from './git/get_email';
import { TGlobalArguments } from './global_arguments';
import { tracer } from './utils/tracer';

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

export async function graphiteWithoutRepo(
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
  const handlerMaybeWithCacheLock = handler.repo
    ? {
        ...handler,
        cacheLock: getCacheLock(),
      }
    : { ...handler, cacheLock: undefined };

  process.on('SIGINT', (): never => {
    handlerMaybeWithCacheLock.cacheLock?.release();
    // End all current traces abruptly.
    tracer.allSpans.forEach((s) => s.end(undefined, new KilledError()));
    postTelemetryInBackground();
    // eslint-disable-next-line no-restricted-syntax
    process.exit(1);
  });
  const contextLite = initContextLite(args);

  try {
    await tracer.span(
      {
        name: 'command',
        resource: canonicalName,
        meta: {
          user: getUserEmail() || 'NotFound',
          version: version,
          processArgv: process.argv.join(' '),
        },
      },
      async () => {
        fetchUpgradePromptInBackground(contextLite);
        postSurveyResponsesInBackground(contextLite);
        if (!handlerMaybeWithCacheLock.repo) {
          await handlerMaybeWithCacheLock.run(contextLite);
          return;
        }

        const context = initContext(contextLite, args);
        return await graphiteHelper(
          canonicalName,
          handlerMaybeWithCacheLock,
          context
        );
      }
    );
  } catch (err) {
    handleGraphiteError(err, contextLite);
    contextLite.splog.debug(err.stack);
    // print errors when debugging tests
    if (process.env.DEBUG) {
      process.stdout.write(err.stack.toString());
    }
    process.exitCode = 1;
  }
  postTelemetryInBackground();
}

// eslint-disable-next-line max-params
async function graphiteHelper(
  canonicalName: string,
  handler: TGraphiteCommandHandlerWithCacheLock,
  context: TContext
): Promise<{
  cacheBefore: string;
  cacheAfter: string;
}> {
  const cacheBefore = context.metaCache.debug;

  try {
    refreshPRInfoInBackground(context);

    if (
      canonicalName !== 'repo init' &&
      !context.repoConfig.graphiteInitialized()
    ) {
      context.splog.info(
        `Graphite has not been initialized, attempting to setup now...`
      );
      context.splog.newline();
      await init({}, context);
    }

    await handler.run(context);
  } finally {
    try {
      context.metaCache.persist();
    } catch (persistError) {
      context.metaCache.clear();
      context.splog.debug(`Failed to persist Graphite cache`);
    }
    handler.cacheLock.release();
  }

  return { cacheBefore, cacheAfter: context.metaCache.debug };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function handleGraphiteError(err: any, context: TContextLite): void {
  switch (err.constructor) {
    case KilledError: // the user doesn't need a message if they ended gt
    case RebaseConflictError: // we've already logged a message
      // pass
      return;

    case UntrackedBranchError:
      context.splog.tip('You can track a branch with `gt branch track`.');
      context.splog.error(err.message);
      return;

    case BadTrunkOperationError:
    case ExitFailedError:
    case ConcurrentExecutionError:
    case PreconditionsFailedError:
    case CommandFailedError:
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
type TGraphiteCommandHandlerWithCacheLock = {
  run: (context: TContext) => Promise<void>;
  cacheLock: TCacheLock;
};
