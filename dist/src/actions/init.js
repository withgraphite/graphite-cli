"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = void 0;
const chalk_1 = __importDefault(require("chalk"));
const prompts_1 = __importDefault(require("prompts"));
const errors_1 = require("../lib/errors");
const find_remote_branch_1 = require("../lib/git/find_remote_branch");
const prompts_helpers_1 = require("../lib/utils/prompts_helpers");
const checkout_branch_1 = require("./checkout_branch");
const track_branch_1 = require("./track_branch");
async function init(args, context) {
    const allBranchNames = context.metaCache.allBranchNames;
    context.splog.info(context.repoConfig.graphiteInitialized()
        ? `Reinitializing Graphite...`
        : `Welcome to Graphite!`);
    context.splog.newline();
    if (allBranchNames.length === 0) {
        throw new errors_1.PreconditionsFailedError([
            `No branches found in current repo; cannot initialize Graphite.`,
            `Please create your first commit and then re-run your Graphite command.`,
        ].join('\n'));
    }
    const newTrunkName = (args.trunk ? allBranchNames.find((b) => b === args.trunk) : undefined) ??
        (await selectTrunkBranch(allBranchNames, context));
    context.repoConfig.setTrunk(newTrunkName);
    context.splog.info(`Trunk set to ${chalk_1.default.green(newTrunkName)}`);
    if (args.reset) {
        context.metaCache.reset(newTrunkName);
        context.splog.info(`All branches have been untracked`);
    }
    else {
        context.metaCache.rebuild(newTrunkName);
    }
    context.splog.newline();
    if (context.interactive) {
        await branchOnboardingFlow(context);
    }
}
exports.init = init;
async function selectTrunkBranch(allBranchNames, context) {
    const inferredTrunk = (0, find_remote_branch_1.findRemoteBranch)(context.repoConfig.getRemote()) ??
        findCommonlyNamedTrunk(context);
    if (!context.interactive) {
        if (inferredTrunk) {
            return inferredTrunk;
        }
        else {
            throw new errors_1.ExitFailedError(`Could not infer trunk branch, pass in an existing branch name with --trunk or run in interactive mode.`);
        }
    }
    return (await (0, prompts_1.default)({
        type: 'autocomplete',
        name: 'branch',
        message: `Select a trunk branch, which you open pull requests against${inferredTrunk ? ` - inferred trunk ${chalk_1.default.green(inferredTrunk)}` : ''} (autocomplete or arrow keys)`,
        choices: allBranchNames.map((b) => {
            return { title: b, value: b };
        }),
        ...(inferredTrunk ? { initial: inferredTrunk } : {}),
        suggest: prompts_helpers_1.suggest,
    }, {
        onCancel: () => {
            throw new errors_1.KilledError();
        },
    })).branch;
}
function findCommonlyNamedTrunk(context) {
    const potentialTrunks = context.metaCache.allBranchNames.filter((b) => ['main', 'master', 'development', 'develop'].includes(b));
    if (potentialTrunks.length === 1) {
        return potentialTrunks[0];
    }
    return undefined;
}
async function branchOnboardingFlow(context) {
    context.splog.tip([
        "If you have an existing branch or stack that you'd like to start working on with Graphite, you can begin tracking it now!",
        'To add other non-Graphite branches to Graphite later, check out `gt branch track`.',
        'If you only want to use Graphite for new branches, feel free to exit now and use `gt branch create`.',
    ].join('\n'));
    if (!(await (0, prompts_1.default)({
        type: 'confirm',
        name: 'value',
        message: `Would you like to start tracking existing branches to create your first stack?`,
        initial: false,
    }, {
        onCancel: () => {
            throw new errors_1.KilledError();
        },
    })).value) {
        return;
    }
    await (0, checkout_branch_1.checkoutBranch)({ branchName: context.metaCache.trunk }, context);
    while (await (0, track_branch_1.trackBranchInteractive)(context))
        ;
}
//# sourceMappingURL=init.js.map