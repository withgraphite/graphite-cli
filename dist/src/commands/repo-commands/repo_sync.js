"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.description = exports.aliases = exports.canonical = exports.command = void 0;
const sync_1 = require("../../actions/sync/sync");
const runner_1 = require("../../lib/runner");
const args = {
    pull: {
        describe: `Pull the trunk branch from remote.`,
        demandOption: false,
        default: true,
        type: 'boolean',
        alias: 'p',
    },
    delete: {
        describe: `Delete branches which have been merged.`,
        demandOption: false,
        default: true,
        type: 'boolean',
        alias: 'd',
    },
    'show-delete-progress': {
        describe: `Show progress through merged branches.`,
        demandOption: false,
        default: false,
        type: 'boolean',
    },
    force: {
        describe: `Don't prompt for confirmation before deleting a branch.`,
        demandOption: false,
        default: false,
        type: 'boolean',
        alias: 'f',
    },
    restack: {
        describe: `Restack the current stack and any stacks with deleted branches.`,
        demandOption: false,
        default: false,
        type: 'boolean',
        alias: 'r',
    },
};
exports.command = 'sync';
exports.canonical = 'repo sync';
exports.aliases = ['s'];
exports.description = 'Pull the trunk branch from remote and delete any branches that have been merged.';
exports.builder = args;
const handler = async (argv) => {
    return (0, runner_1.graphite)(argv, exports.canonical, async (context) => {
        await (0, sync_1.syncAction)({
            pull: argv.pull,
            force: argv.force,
            delete: argv.delete,
            showDeleteProgress: argv['show-delete-progress'],
            restack: argv.restack,
        }, context);
    });
};
exports.handler = handler;
//# sourceMappingURL=repo_sync.js.map