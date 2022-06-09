"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.graphiteLite = exports.graphite = void 0;
const package_json_1 = require("../../package.json");
const init_1 = require("../actions/init");
const fetch_pr_info_1 = require("../background_tasks/fetch_pr_info");
const post_survey_1 = require("../background_tasks/post_survey");
const upgrade_prompt_1 = require("../background_tasks/upgrade_prompt");
const context_1 = require("./context");
const cache_lock_1 = require("./engine/cache_lock");
const errors_1 = require("./errors");
const context_2 = require("./telemetry/context");
const post_traces_1 = require("./telemetry/post_traces");
const sigint_handler_1 = require("./telemetry/sigint_handler");
const tracer_1 = require("./telemetry/tracer");
const parse_args_1 = require("./utils/parse_args");
async function graphite(args, canonicalName, handler) {
    return graphiteInternal(args, canonicalName, {
        repo: true,
        run: handler,
    });
}
exports.graphite = graphite;
async function graphiteLite(args, canonicalName, handler) {
    return graphiteInternal(args, canonicalName, {
        repo: false,
        run: handler,
    });
}
exports.graphiteLite = graphiteLite;
async function graphiteInternal(args, canonicalName, handler) {
    const parsedArgs = (0, parse_args_1.parseArgs)(args);
    const start = Date.now();
    const handlerWithCacheLock = handler.repo ? { ...handler, cacheLock: (0, cache_lock_1.getCacheLock)() } : handler;
    (0, sigint_handler_1.registerSigintHandler)({
        commandName: parsedArgs.command,
        canonicalCommandName: canonicalName,
        startTime: start,
        cacheLock: handlerWithCacheLock.cacheLock,
    });
    const err = await tracer_1.tracer.span({
        name: 'command',
        resource: parsedArgs.command,
        meta: {
            user: (0, context_2.getUserEmail)() || 'NotFound',
            version: package_json_1.version,
            args: parsedArgs.args,
            alias: parsedArgs.alias,
        },
    }, () => {
        const contextLite = (0, context_1.initContextLite)(args);
        return graphiteHelper(canonicalName, args, contextLite, handlerWithCacheLock);
    });
    const end = Date.now();
    (0, post_traces_1.postTelemetryInBackground)({
        canonicalCommandName: canonicalName,
        commandName: parsedArgs.command,
        durationMiliSeconds: end - start,
        err,
    });
}
// TODO check with Greg about whether we still need all the OldTelemetry stuff?
// Then we can simplify this function and signature a lot
// eslint-disable-next-line max-params
async function graphiteHelper(canonicalName, args, contextLite, handler) {
    const context = handler.repo
        ? { ...handler, ...(0, context_1.initContext)(contextLite, args) }
        : { ...handler, ...contextLite };
    const err = await (async () => {
        try {
            (0, upgrade_prompt_1.fetchUpgradePromptInBackground)(context);
            (0, post_survey_1.postSurveyResponsesInBackground)(context);
            if (!context.repo) {
                await context.run(context);
                return undefined;
            }
            (0, fetch_pr_info_1.refreshPRInfoInBackground)(context);
            if (canonicalName !== 'repo init' &&
                !context.repoConfig.graphiteInitialized()) {
                context.splog.info(`Graphite has not been initialized, attempting to setup now...`);
                context.splog.newline();
                await (0, init_1.init)(context);
            }
            await context.run(context);
            return undefined;
        }
        catch (err) {
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
    }
    catch (persistError) {
        context.metaCache.clear();
        context.splog.debug(`Failed to persist Graphite cache`);
    }
    context.cacheLock.release();
    return err;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function handleGraphiteError(err, context) {
    switch (err.constructor) {
        case errors_1.KilledError: // the user doesn't need a message if they ended gt
        case errors_1.RebaseConflictError: // we've already logged a message
            // pass
            return;
        case errors_1.UntrackedBranchError:
            context.splog.tip('You can track a branch with `gt branch track`.');
            context.splog.error(err.message);
            return;
        case errors_1.BadTrunkOperationError:
        case errors_1.ExitFailedError:
        case errors_1.ConcurrentExecutionError:
        case errors_1.PreconditionsFailedError:
        default:
            context.splog.error(err.message);
            return;
    }
}
//# sourceMappingURL=runner.js.map