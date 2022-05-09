"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.passthrough = void 0;
const chalk_1 = __importDefault(require("chalk"));
const child_process_1 = __importDefault(require("child_process"));
const splog_1 = require("./utils/splog");
const GIT_COMMAND_ALLOWLIST = [
    'add',
    'am',
    'apply',
    'archive',
    'bisect',
    'blame',
    'bundle',
    'cherry-pick',
    'clean',
    'clone',
    'diff',
    'difftool',
    'fetch',
    'format-patch',
    'fsck',
    'grep',
    'merge',
    'mv',
    'notes',
    'pull',
    'push',
    'range-diff',
    'rebase',
    'reflog',
    'remote',
    'request-pull',
    'reset',
    'restore',
    'revert',
    'rm',
    'show',
    'send-email',
    'sparse-checkout',
    'stash',
    'status',
    'submodule',
    'switch',
    'tag',
];
function passthrough(args) {
    if (args.length <= 2) {
        return;
    }
    const command = args[2];
    if (!GIT_COMMAND_ALLOWLIST.includes(command)) {
        return;
    }
    splog_1.logInfo(chalk_1.default.grey([
        `Command: "${chalk_1.default.yellow(command)}" is not a Graphite command, but is supported by git. Passing command through to git...`,
        `Running: "${chalk_1.default.yellow(`git ${args.slice(2).join(' ')}`)}"\n`,
    ].join('\n')));
    try {
        child_process_1.default.spawnSync('git', args.slice(2), { stdio: 'inherit' });
    }
    catch (err) {
        splog_1.logError(err);
        // eslint-disable-next-line no-restricted-syntax
        process.exit(1);
    }
    // eslint-disable-next-line no-restricted-syntax
    process.exit(0);
}
exports.passthrough = passthrough;
//# sourceMappingURL=passthrough.js.map