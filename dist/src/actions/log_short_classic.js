"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logShortClassic = void 0;
const log_1 = require("./log");
function displayBranchesInternal(opts, context) {
    const currentBranchName = context.metaCache.currentBranch;
    const currentChoice = {
        display: `${'  '.repeat(opts.indent ?? 0)}↱ ${(0, log_1.displayBranchName)(opts.branchName, context)}`,
        branchName: opts.branchName,
    };
    return (context.metaCache
        .getChildren(opts.branchName)
        ?.filter((b) => b !== currentBranchName || !opts.omitCurrentBranch)
        .map((b) => displayBranchesInternal({
        ...opts,
        branchName: b,
        indent: (opts.indent ?? 0) + 1,
    }, context))
        .reduceRight((acc, arr) => arr.concat(acc), [currentChoice]) ?? []);
}
function logShortClassic(context) {
    context.splog.info(displayBranchesInternal({ branchName: context.metaCache.trunk, highlightCurrentBranch: true }, context)
        .map((b) => b.display)
        .join('\n'));
}
exports.logShortClassic = logShortClassic;
//# sourceMappingURL=log_short_classic.js.map