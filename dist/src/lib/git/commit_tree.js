"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCommitTree = void 0;
const run_command_1 = require("../utils/run_command");
const get_sha_1 = require("./get_sha");
function getCommitTree(branchNames) {
    const parentOfMergeBase = (0, get_sha_1.getSha)(`${(0, run_command_1.runGitCommand)({
        args: [`merge-base`, `--octopus`, ...branchNames],
        onError: 'ignore',
        resource: 'parentOfMergeBase',
    })}~`);
    const ret = {};
    (0, run_command_1.runGitCommandAndSplitLines)({
        args: [
            `rev-list`,
            `--parents`,
            ...(parentOfMergeBase
                ? [`^${parentOfMergeBase}`, ...branchNames]
                : [`--all`]),
        ],
        options: {
            maxBuffer: 1024 * 1024 * 1024,
        },
        onError: 'throw',
        resource: 'getCommitTree',
    })
        .map((l) => l.split(' '))
        .forEach((l) => (ret[l[0]] = l.slice(1)));
    return ret;
}
exports.getCommitTree = getCommitTree;
//# sourceMappingURL=commit_tree.js.map