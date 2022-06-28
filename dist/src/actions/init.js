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
const checkout_branch_1 = require("./checkout_branch");
const track_branch_1 = require("./track_branch");
async function init(context, trunk) {
    const allBranchNames = context.metaCache.allBranchNames;
    logWelcomeMessage(context);
    context.splog.newline();
    if (allBranchNames.length === 0) {
        context.splog.error(`Ouch! We can't setup Graphite in a repo without any branches -- this is likely because you're initializing Graphite in a blank repo. Please create your first commit and then re-run your Graphite command.`);
        context.splog.newline();
        throw new errors_1.PreconditionsFailedError(`No branches found in current repo; cannot initialize Graphite.`);
    }
    const newTrunkName = (trunk ? allBranchNames.find((b) => b === trunk) : undefined) ??
        (await selectTrunkBranch(allBranchNames, context));
    context.repoConfig.setTrunk(newTrunkName);
    context.metaCache.rebuild(newTrunkName);
    context.splog.info(`Trunk set to ${chalk_1.default.green(newTrunkName)}`);
    context.splog.info(`Graphite repo config saved at "${context.repoConfig.path}"`);
    if (context.interactive) {
        await branchOnboardingFlow(context);
    }
}
exports.init = init;
function logWelcomeMessage(context) {
    if (!context.repoConfig.graphiteInitialized()) {
        context.splog.info('Welcome to Graphite!');
    }
    else {
        context.splog.info(`Regenerating Graphite repo config (${context.repoConfig.path})`);
    }
}
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
        suggest: (input, choices) => choices.filter((c) => c.value.includes(input)),
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
        message: `Would you like start tracking existing branches to create your first stack?`,
        initial: false,
    }, {
        onCancel: () => {
            throw new errors_1.KilledError();
        },
    })).value) {
        return;
    }
    await (0, checkout_branch_1.checkoutBranch)(context.metaCache.trunk, context);
    while (await (0, track_branch_1.trackBranchInteractive)(context))
        ;
}
//# sourceMappingURL=init.js.map