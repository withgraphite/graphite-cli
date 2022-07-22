"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDiffEmpty = exports.showDiff = exports.getUnstagedChanges = exports.detectStagedChanges = exports.detectUnsubmittedChanges = void 0;
const run_command_1 = require("../utils/run_command");
function detectUnsubmittedChanges(branchName, remote) {
    return ((0, run_command_1.runGitCommand)({
        args: [
            `--no-pager`,
            `log`,
            `--oneline`,
            `${branchName}...${remote}/${branchName}`,
        ],
        onError: 'throw',
        resource: 'detectUnsubmittedChanges',
    }).length !== 0);
}
exports.detectUnsubmittedChanges = detectUnsubmittedChanges;
function detectStagedChanges() {
    return ((0, run_command_1.runGitCommand)({
        args: [`--no-pager`, `diff`, `--no-ext-diff`, `--shortstat`, `--cached`],
        onError: 'throw',
        resource: 'detectStagedChanges',
    }).length > 0);
}
exports.detectStagedChanges = detectStagedChanges;
function getUnstagedChanges() {
    return (0, run_command_1.runGitCommand)({
        args: [
            `-c`,
            `color.ui=always`,
            `--no-pager`,
            `diff`,
            `--no-ext-diff`,
            `--stat`,
        ],
        onError: 'throw',
        resource: 'getUnstagedChanges',
    });
}
exports.getUnstagedChanges = getUnstagedChanges;
function showDiff(left, right) {
    (0, run_command_1.runGitCommand)({
        args: [
            `-c`,
            `color.ui=always`,
            `--no-pager`,
            `diff`,
            `--no-ext-diff`,
            left,
            right,
            `--`,
        ],
        options: { stdio: 'inherit' },
        onError: 'throw',
        resource: 'showDiff',
    });
}
exports.showDiff = showDiff;
function isDiffEmpty(left, right) {
    return ((0, run_command_1.runGitCommand)({
        args: [
            `--no-pager`,
            `diff`,
            `--no-ext-diff`,
            `--shortstat`,
            left,
            right,
            `--`,
        ],
        onError: 'throw',
        resource: 'isDiffEmpty',
    }).length === 0);
}
exports.isDiffEmpty = isDiffEmpty;
//# sourceMappingURL=diff.js.map