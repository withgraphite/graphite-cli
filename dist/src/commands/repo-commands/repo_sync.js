"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.description = exports.aliases = exports.canonical = exports.command = void 0;
const sync_1 = require("../../actions/sync/sync");
const profile_1 = require("../../lib/telemetry/profile");
const args = {
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
    resubmit: {
        describe: `Re-submit branches whose merge bases have changed locally and now differ from their PRs.`,
        demandOption: false,
        default: true,
        type: 'boolean',
        alias: 'r',
    },
    force: {
        describe: `Don't prompt you to confirm when a branch will be deleted or re-submitted.`,
        demandOption: false,
        default: false,
        type: 'boolean',
        alias: 'f',
    },
    pull: {
        describe: `Pull the trunk branch from remote before searching for stale branches.`,
        demandOption: false,
        default: true,
        type: 'boolean',
        alias: 'p',
    },
    'show-dangling': {
        describe: `Show prompts to fix dangling branches (branches for whose parent is unknown to Graphite).`,
        demandOption: false,
        default: true,
        type: 'boolean',
        alias: 's',
    },
};
exports.command = 'sync';
exports.canonical = 'repo sync';
exports.aliases = ['s'];
exports.description = 'Delete any branches that have been merged or squashed into the trunk branch, and recursively check for stack states against main.';
exports.builder = args;
const handler = (argv) => __awaiter(void 0, void 0, void 0, function* () {
    return profile_1.profile(argv, exports.canonical, (context) => __awaiter(void 0, void 0, void 0, function* () {
        yield sync_1.syncAction({
            pull: argv.pull,
            force: argv.force,
            resubmit: argv.resubmit,
            delete: argv.delete,
            showDeleteProgress: argv['show-delete-progress'],
            fixDanglingBranches: argv['show-dangling'],
        }, { type: 'REPO' }, context);
    }));
});
exports.handler = handler;
//# sourceMappingURL=repo_sync.js.map