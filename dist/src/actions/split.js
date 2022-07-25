"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.splitCurrentBranch = void 0;
const chalk_1 = __importDefault(require("chalk"));
const prompts_1 = __importDefault(require("prompts"));
const colors_1 = require("../lib/colors");
const scope_spec_1 = require("../lib/engine/scope_spec");
const errors_1 = require("../lib/errors");
const diff_1 = require("../lib/git/diff");
const preconditions_1 = require("../lib/preconditions");
const branch_name_1 = require("../lib/utils/branch_name");
const prompts_helpers_1 = require("../lib/utils/prompts_helpers");
const restack_1 = require("./restack");
const track_branch_1 = require("./track_branch");
async function splitCurrentBranch(args, context) {
    if (!context.interactive) {
        throw new errors_1.PreconditionsFailedError('This command must be run in interactive mode.');
    }
    (0, preconditions_1.uncommittedTrackedChangesPrecondition)();
    const branchToSplit = context.metaCache.currentBranchPrecondition;
    if (!context.metaCache.isBranchTracked(branchToSplit)) {
        await (0, track_branch_1.trackBranch)({ branchName: branchToSplit, parentBranchName: undefined, force: false }, context);
    }
    // If user did not select a style, prompt unless there is only one commit
    const style = args.style ??
        (context.metaCache.getAllCommits(branchToSplit, 'SHA').length > 1
            ? (await (0, prompts_1.default)({
                type: 'select',
                name: 'value',
                message: `How would you like to split ${branchToSplit}?`,
                choices: [
                    {
                        title: 'By commit - slice up the history of this branch.',
                        value: 'commit',
                    },
                    {
                        title: 'By hunk - split into new single-commit branches.',
                        value: 'hunk',
                    },
                    { title: 'Cancel this command (Ctrl+C).', value: 'abort' },
                ],
            }, {
                onCancel: () => {
                    throw new errors_1.KilledError();
                },
            })).value
            : 'hunk');
    const actions = {
        commit: splitByCommit,
        hunk: splitByHunk,
        abort: () => {
            throw new errors_1.KilledError();
        },
    };
    const split = await actions[style](branchToSplit, context);
    context.metaCache.applySplitToCommits({
        branchToSplit,
        ...split,
    });
    (0, restack_1.restackBranches)(context.metaCache.getRelativeStack(branchToSplit, scope_spec_1.SCOPE.UPSTACK_EXCLUSIVE), context);
}
exports.splitCurrentBranch = splitCurrentBranch;
async function splitByCommit(branchToSplit, context) {
    const instructions = getSplitByCommitInstructions(branchToSplit, context);
    context.splog.info(instructions);
    const readableCommits = context.metaCache.getAllCommits(branchToSplit, 'READABLE');
    const numChildren = context.metaCache.getChildren(branchToSplit).length;
    const parentBranchName = context.metaCache.getParentPrecondition(branchToSplit);
    const branchPoints = await getBranchPoints({
        readableCommits,
        numChildren,
        parentBranchName,
    });
    const branchNames = [];
    for (let i = 0; i < branchPoints.length; i++) {
        context.splog.info(chalk_1.default.yellow(`Commits for branch ${i + 1}:`));
        context.splog.info(readableCommits
            .slice(branchPoints[branchPoints.length - i - 1], 
        // we want the next line to be undefined for i = 0
        branchPoints[branchPoints.length - i])
            .join('\n'));
        context.splog.newline();
        branchNames.push(await promptNextBranchName({ branchNames, branchToSplit }, context));
    }
    context.metaCache.detach();
    return { branchNames, branchPoints };
}
function getSplitByCommitInstructions(branchToSplit, context) {
    return [
        `Splitting the commits of ${chalk_1.default.cyan(branchToSplit)} into multiple branches.`,
        ...(context.metaCache.getPrInfo(branchToSplit)?.number
            ? [
                `If any of the new branches keeps the name ${chalk_1.default.cyan(branchToSplit)}, it will be linked to PR #${context.metaCache.getPrInfo(branchToSplit)?.number}.`,
            ]
            : []),
        ``,
        chalk_1.default.yellow(`For each branch you'd like to create:`),
        `1. Choose which commit it begins at using the below prompt.`,
        `2. Choose its name.`,
        ``,
    ].join('\n');
}
async function getBranchPoints({ readableCommits, numChildren, parentBranchName, }) {
    // Array where nth index is whether we want a branch pointing to nth commit
    const isBranchPoint = readableCommits.map((_, idx) => idx === 0);
    //  start the cursor at the current commmit
    let lastValue = 0;
    // -1 signifies thatwe are done
    while (lastValue !== -1) {
        // We count branches in reverse so start at the total number of branch points
        let branchNumber = Object.values(isBranchPoint).filter((v) => v).length + 1;
        const showChildrenLine = numChildren > 0;
        lastValue = parseInt((await (0, prompts_1.default)({
            type: 'select',
            name: 'value',
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore the types are out of date
            warn: ' ',
            message: `Toggle a commit to split the branch there.`,
            hint: 'Arrow keys and return/space. Select confirm to finish.',
            initial: lastValue + (showChildrenLine ? 1 : 0),
            choices: [
                ...(showChildrenLine
                    ? [
                        {
                            title: chalk_1.default.reset(`${' '.repeat(10)}${chalk_1.default.dim(`${numChildren} ${numChildren > 1 ? 'children' : 'child'}`)}`),
                            ['disabled']: true,
                            value: '0', // noop
                        },
                    ]
                    : []),
                ...readableCommits.map((commit, index) => {
                    const shouldDisplayBranchNumber = isBranchPoint[index];
                    if (shouldDisplayBranchNumber) {
                        branchNumber--;
                    }
                    const titleColor = colors_1.GRAPHITE_COLORS[(branchNumber - 1) % colors_1.GRAPHITE_COLORS.length];
                    const titleText = `${shouldDisplayBranchNumber
                        ? `Branch ${branchNumber}: `
                        : ' '.repeat(10)}${commit}`;
                    const title = chalk_1.default.rgb(...titleColor)(titleText);
                    return { title, value: '' + index };
                }),
                {
                    title: chalk_1.default.reset(`${' '.repeat(10)}${chalk_1.default.dim(parentBranchName)}`),
                    ['disabled']: true,
                    value: '0', // noop
                },
                {
                    title: `${' '.repeat(10)}Confirm`,
                    value: '-1', // done
                },
            ],
        }, {
            onCancel: () => {
                throw new errors_1.KilledError();
            },
        })).value);
        (0, prompts_helpers_1.clearPromptResultLine)();
        // Never toggle the first commmit, it always needs a branch
        if (lastValue !== 0) {
            isBranchPoint[lastValue] = !isBranchPoint[lastValue];
        }
    }
    return isBranchPoint
        .map((value, index) => (value ? index : undefined))
        .filter((value) => typeof value !== 'undefined');
}
async function splitByHunk(branchToSplit, context) {
    // Keeps new files tracked so they get added by the `commit -p`
    context.metaCache.detachAndResetBranchChanges();
    const branchNames = [];
    try {
        const instructions = getSplitByHunkInstructions(branchToSplit, context);
        const defaultCommitMessage = context.metaCache
            .getAllCommits(branchToSplit, 'MESSAGE')
            .reverse()
            .join('\n\n');
        for (let unstagedChanges = (0, diff_1.getUnstagedChanges)(); unstagedChanges.length > 0; unstagedChanges = (0, diff_1.getUnstagedChanges)()) {
            context.splog.info(instructions);
            context.splog.newline();
            context.splog.info(chalk_1.default.yellow('Remaining changes:'));
            context.splog.info(' ' + unstagedChanges);
            context.splog.newline();
            context.splog.info(chalk_1.default.yellow(`Stage changes for branch ${branchNames.length + 1}:`));
            context.metaCache.commit({
                message: defaultCommitMessage,
                edit: true,
                patch: true,
            });
            branchNames.push(await promptNextBranchName({ branchNames, branchToSplit }, context));
        }
    }
    catch (e) {
        // Handle a CTRL-C gracefully
        context.metaCache.forceCheckoutBranch(branchToSplit);
        context.splog.newline();
        context.splog.info(`Exited early: no new branches created. You are still on ${chalk_1.default.cyan(branchToSplit)}.`);
        throw e;
    }
    return {
        branchNames,
        // for single-commit branches, there is a branch point at each commit
        branchPoints: branchNames.map((_, idx) => idx),
    };
}
function getSplitByHunkInstructions(branchToSplit, context) {
    return [
        `Splitting ${chalk_1.default.cyan(branchToSplit)} into multiple single-commit branches.`,
        ...(context.metaCache.getPrInfo(branchToSplit)?.number
            ? [
                `If any of the new branches keeps the name ${chalk_1.default.cyan(branchToSplit)}, it will be linked to PR #${context.metaCache.getPrInfo(branchToSplit)?.number}.`,
            ]
            : []),
        ``,
        chalk_1.default.yellow(`For each branch you'd like to create:`),
        `1. Follow the prompts to stage the changes that you'd like to include.`,
        `2. Enter a commit message.`,
        `3. Pick a branch name.`,
        `The command will continue until all changes have been added to a new branch.`,
    ].join('\n');
}
async function promptNextBranchName({ branchToSplit, branchNames, }, context) {
    const { branchName } = await (0, prompts_1.default)({
        type: 'text',
        name: 'branchName',
        message: `Choose a name for branch ${branchNames.length + 1}`,
        initial: getInitialNextBranchName(branchToSplit, branchNames),
        validate: (name) => {
            const calculatedName = (0, branch_name_1.replaceUnsupportedCharacters)(name, context);
            return branchNames.includes(calculatedName) ||
                (calculatedName !== branchToSplit &&
                    context.metaCache.allBranchNames.includes(calculatedName))
                ? 'Branch name is already in use, choose a different name.'
                : true;
        },
    }, {
        onCancel: () => {
            throw new errors_1.KilledError();
        },
    });
    context.splog.newline();
    return (0, branch_name_1.replaceUnsupportedCharacters)(branchName, context);
}
function getInitialNextBranchName(originalBranchName, branchNames) {
    return branchNames.includes(originalBranchName)
        ? getInitialNextBranchName(`${originalBranchName}_split`, branchNames)
        : originalBranchName;
}
//# sourceMappingURL=split.js.map