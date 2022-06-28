"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.switchBranch = void 0;
const chalk_1 = __importDefault(require("chalk"));
const errors_1 = require("../errors");
const escape_for_shell_1 = require("../utils/escape_for_shell");
const exec_sync_1 = require("../utils/exec_sync");
function switchBranch(branch, opts) {
    (0, exec_sync_1.gpExecSync)({
        command: `git switch ${opts?.new ? '-c ' : ''}${(0, escape_for_shell_1.q)(branch)}`,
        options: { stdio: 'ignore' },
    }, () => {
        throw new errors_1.ExitFailedError(`Failed to switch to ${opts?.new ? 'new ' : ''}branch ${chalk_1.default.yellow(branch)}`);
    });
}
exports.switchBranch = switchBranch;
//# sourceMappingURL=switch_branch.js.map