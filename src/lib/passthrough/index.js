"use strict";
exports.__esModule = true;
exports.passthrough = void 0;
var chalk_1 = require("chalk");
var child_process_1 = require("child_process");
var utils_1 = require("../utils");
var GIT_COMMAND_ALLOWLIST = [
    'status',
    'clone',
    'add',
    'mv',
    'restore',
    'rm',
    'sparse-checkout',
    'bisect',
    'diff',
    'grep',
    'show',
    'status',
    'merge',
    'rebase',
    'reset',
    'switch',
    'tag',
    'fetch',
    'pull',
    'push',
];
function passthrough(args) {
    if (args.length <= 2) {
        return;
    }
    var command = args[2];
    if (!GIT_COMMAND_ALLOWLIST.includes(command)) {
        return;
    }
    utils_1.logInfo(chalk_1["default"].grey([
        "Command: \"" + chalk_1["default"].yellow(command) + "\" is not a Graphite command, but is supported by git. Passing command through to git...",
        "Running: \"" + chalk_1["default"].yellow("git " + args.slice(2).join(' ')) + "\"\n",
    ].join('\n')));
    try {
        child_process_1["default"].spawnSync('git', args.slice(2), { stdio: 'inherit' });
    }
    catch (err) {
        utils_1.logError(err);
        // eslint-disable-next-line no-restricted-syntax
        process.exit(1);
    }
    // eslint-disable-next-line no-restricted-syntax
    process.exit(0);
}
exports.passthrough = passthrough;
