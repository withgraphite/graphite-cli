"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.canonical = exports.description = exports.command = void 0;
const runner_1 = require("../../lib/runner");
const args = {
    ['include-commit-messages']: {
        demandOption: false,
        type: 'boolean',
        describe: 'Include commit messages in PR body by default.  Disable with --no-include-commit-messages.',
    },
};
exports.command = 'submit-body';
exports.description = 'Options for default PR descriptions.';
exports.canonical = 'user submit-body';
exports.builder = args;
const handler = async (argv) => {
    return (0, runner_1.graphiteWithoutRepo)(argv, exports.canonical, async (context) => {
        if (argv['include-commit-messages'] === true) {
            context.userConfig.update((data) => (data.submitIncludeCommitMessages = true));
            context.splog.info(`default PR body will include commit messages`);
        }
        else if (argv['include-commit-messages'] === false) {
            context.userConfig.update((data) => (data.submitIncludeCommitMessages = false));
            context.splog.info(`default PR body will not include commit messages`);
        }
        else {
            context.userConfig.data.submitIncludeCommitMessages
                ? context.splog.info(`default PR body will include commit messages`)
                : context.splog.info(`default PR body will not include commit messages`);
        }
    });
};
exports.handler = handler;
//# sourceMappingURL=submit_body.js.map