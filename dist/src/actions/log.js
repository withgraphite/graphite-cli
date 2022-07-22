"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.interactiveBranchSelection = exports.logForConflictStatus = exports.logAction = void 0;
const chalk_1 = __importDefault(require("chalk"));
const prompts_1 = __importDefault(require("prompts"));
const strip_ansi_1 = __importDefault(require("strip-ansi"));
const colors_1 = require("../lib/colors");
const errors_1 = require("../lib/errors");
const prompts_helpers_1 = require("../lib/utils/prompts_helpers");
const show_branch_1 = require("./show_branch");
function getUntrackedBranchNames(context) {
    return context.metaCache.allBranchNames.filter((branchName) => !context.metaCache.isTrunk(branchName) &&
        !context.metaCache.isBranchTracked(branchName));
}
function logAction(opts, context) {
    getStackLines({
        short: opts.style === 'SHORT',
        reverse: opts.reverse,
        branchName: opts.branchName,
        indentLevel: 0,
        steps: opts.steps,
    }, context).forEach((line) => context.splog.info(line));
    if (opts.showUntracked) {
        context.splog.newline();
        context.splog.info(chalk_1.default.yellowBright(`Untracked branches:`));
        getUntrackedBranchNames(context).map((branchName) => context.splog.info(branchName));
    }
    if (opts.style === 'SHORT' &&
        context.metaCache.isTrunk(opts.branchName) &&
        !opts.reverse &&
        !opts.steps) {
        context.splog.tip('Miss the old version of log short? Try the `--classic` flag!');
    }
}
exports.logAction = logAction;
function logForConflictStatus(rebaseHead, context) {
    getStackLines({
        short: true,
        reverse: false,
        branchName: rebaseHead,
        indentLevel: 0,
        steps: 1,
        noStyleBranchName: true,
    }, context).forEach((line) => context.splog.info(line));
}
exports.logForConflictStatus = logForConflictStatus;
async function interactiveBranchSelection(opts, context) {
    const choices = getStackLines({
        short: true,
        reverse: false,
        branchName: context.metaCache.trunk,
        indentLevel: 0,
        omitCurrentBranch: opts.omitCurrentBranch,
        noStyleBranchName: true,
    }, context)
        .map((stackLine) => ({
        title: stackLine,
        value: ((stackLine) => stackLine.substring(stackLine.lastIndexOf('  ') + 2))((0, strip_ansi_1.default)(stackLine)),
    }))
        .concat(opts.showUntracked
        ? getUntrackedBranchNames(context).map((branchName) => ({
            title: branchName,
            value: branchName,
        }))
        : []);
    const indexOfCurrentIfPresent = choices.findIndex((choice) => choice.value ===
        (opts.omitCurrentBranch
            ? context.metaCache.getParentPrecondition(context.metaCache.currentBranchPrecondition)
            : context.metaCache.currentBranch));
    const initial = indexOfCurrentIfPresent !== -1
        ? indexOfCurrentIfPresent
        : choices.length - 1;
    const chosenBranch = (await (0, prompts_1.default)({
        type: 'autocomplete',
        name: 'branch',
        message: opts.message,
        choices,
        initial,
        suggest: prompts_helpers_1.suggest,
    }, {
        onCancel: () => {
            throw new errors_1.KilledError();
        },
    })).branch;
    (0, prompts_helpers_1.clearPromptResultLine)();
    context.splog.debug(`Selected ${chosenBranch}`);
    return chosenBranch;
}
exports.interactiveBranchSelection = interactiveBranchSelection;
function getLogShortColor(toColor, index) {
    return chalk_1.default.rgb(...colors_1.GRAPHITE_COLORS[Math.floor(index / 2) % colors_1.GRAPHITE_COLORS.length])(toColor);
}
function getStackLines(args, context) {
    const overallIndent = { value: 0 };
    const outputDeep = [
        getUpstackExclusiveLines({ ...args, overallIndent }, context),
        getBranchLines(args, context),
        getDownstackExclusiveLines(args, context),
    ];
    return (args.reverse ? outputDeep.reverse().flat() : outputDeep.flat()).map((line) => {
        if (!args.short) {
            return line;
        }
        // This lambda is for finalizing log short formatting
        const circleIndex = line.indexOf('◯');
        const arrowIndex = line.indexOf('▸');
        const branchNameAndDetails = line.slice(arrowIndex + 1);
        const replaceCircle = !args.noStyleBranchName &&
            context.metaCache.currentBranch &&
            branchNameAndDetails.split(' ')[0] === context.metaCache.currentBranch;
        return `${line
            .slice(0, arrowIndex)
            .split('')
            .map(getLogShortColor)
            .map((c) => (replaceCircle ? c.replace('◯', '◉') : c))
            .join('')}${' '.repeat(overallIndent.value * 2 + 3 - arrowIndex)}${getLogShortColor(line.slice(arrowIndex + 1), circleIndex)}`;
    });
}
function getDownstackExclusiveLines(args, context) {
    if (context.metaCache.isTrunk(args.branchName)) {
        return [];
    }
    const outputDeep = [
        context.metaCache.trunk,
        ...context.metaCache.getRelativeStack(args.branchName, {
            recursiveParents: true,
        }),
    ]
        .slice(-(args.steps ?? 0))
        .map((branchName) => 
    // skip the branching line for downstack because we show 1 child per branch
    getBranchLines({ ...args, branchName, skipBranchingLine: true }, context));
    // opposite of the rest of these because we got the list from trunk upward
    return args.reverse ? outputDeep.flat() : outputDeep.reverse().flat();
}
function getUpstackInclusiveLines(args, context) {
    const outputDeep = [
        getUpstackExclusiveLines(args, context),
        getBranchLines(args, context),
    ];
    return args.reverse ? outputDeep.reverse().flat() : outputDeep.flat();
}
function getUpstackExclusiveLines(args, context) {
    if (args.steps === 0) {
        return [];
    }
    const children = context.metaCache
        .getChildren(args.branchName)
        .filter((child) => !args.omitCurrentBranch ||
        child !== context.metaCache.currentBranchPrecondition);
    const numChildren = children.length;
    return children.flatMap((child, i) => getUpstackInclusiveLines({
        ...args,
        steps: args.steps ? args.steps - 1 : undefined,
        branchName: child,
        indentLevel: args.indentLevel + (args.reverse ? numChildren - i - 1 : i),
    }, context));
}
function getBranchLines(args, context) {
    const children = context.metaCache.getChildren(args.branchName);
    const numChildren = children.length -
        (args.omitCurrentBranch &&
            children.includes(context.metaCache.currentBranchPrecondition)
            ? 1
            : 0);
    if (args.overallIndent) {
        args.overallIndent.value = Math.max(args.overallIndent.value, args.indentLevel);
    }
    // `gt log short` case
    if (args.short) {
        return [
            `${'│ '.repeat(args.indentLevel)}${'◯'}${args.skipBranchingLine || numChildren <= 2
                ? ''
                : (args.reverse ? '─┬' : '─┴').repeat(numChildren - 2)}${args.skipBranchingLine || numChildren <= 1
                ? ''
                : args.reverse
                    ? '─┐'
                    : '─┘'}▸${args.branchName}${args.noStyleBranchName ||
                context.metaCache.isBranchFixed(args.branchName)
                ? ''
                : chalk_1.default.reset(` (needs restack)`)}`,
        ];
    }
    // `gt log` case
    const outputDeep = [
        args.skipBranchingLine
            ? []
            : getBranchingLine({
                numChildren,
                reverse: args.reverse,
                indentLevel: args.indentLevel,
            }),
        getInfoLines({ ...args, noStem: args.reverse && numChildren === 0 }, context),
    ];
    return args.reverse ? outputDeep.reverse().flat() : outputDeep.flat();
}
function getBranchingLine(args) {
    // return type is array so that we don't add lines to the output in the empty case
    if (args.numChildren < 2) {
        return [];
    }
    const [middleBranch, lastBranch] = args.reverse
        ? ['──┬', '──┐']
        : ['──┴', '──┘'];
    return [
        getPrefix(args.indentLevel) +
            '├'.concat(middleBranch.repeat(args.numChildren > 2 ? args.numChildren - 2 : 0), lastBranch),
    ];
}
function getInfoLines(args, context) {
    const isCurrent = args.branchName === context.metaCache.currentBranch;
    return (0, show_branch_1.getBranchInfo)({
        branchName: args.branchName,
        displayAsCurrent: isCurrent,
        showCommitNames: args.reverse ? 'REVERSE' : 'STANDARD',
    }, context)
        .map((line, index) => `${getPrefix(args.indentLevel)}${index === 0
        ? isCurrent
            ? chalk_1.default.cyan('◉')
            : '◯'
        : args.noStem
            ? ' '
            : '│'} ${line}`)
        .concat([getPrefix(args.indentLevel) + (args.noStem ? ' ' : '│')]);
}
function getPrefix(indentLevel) {
    return '│  '.repeat(indentLevel);
}
//# sourceMappingURL=log.js.map