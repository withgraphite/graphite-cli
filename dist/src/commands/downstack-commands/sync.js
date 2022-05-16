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
exports.handler = exports.builder = exports.description = exports.canonical = exports.command = void 0;
const get_downstack_dependencies_1 = require("../../actions/sync/get_downstack_dependencies");
const sync_1 = require("../../actions/sync/sync");
const errors_1 = require("../../lib/errors");
const profile_1 = require("../../lib/telemetry/profile");
const splog_1 = require("../../lib/utils/splog");
const args = {
    branch: {
        describe: `Branch to sync from`,
        demandOption: true,
        type: 'string',
        positional: true,
    },
};
exports.command = 'sync [branch]';
exports.canonical = 'downstack sync';
exports.description = 'Sync a branch and its downstack from remote.';
exports.builder = args;
const handler = (argv) => __awaiter(void 0, void 0, void 0, function* () {
    return profile_1.profile(argv, exports.canonical, (context) => __awaiter(void 0, void 0, void 0, function* () {
        if (!argv.branch) {
            // TODO implement a picker that allows selection of legal remote branches (open PRs)
            throw new errors_1.ExitFailedError('Remote branch picker not yet implemented');
        }
        const downstackToSync = yield get_downstack_dependencies_1.getDownstackDependencies(argv.branch, context);
        splog_1.logDebug(`Downstack branch list:\n${downstackToSync.join('\n')}\n`);
        yield sync_1.syncAction({
            pull: true,
            fixDanglingBranches: false,
            delete: false,
            showDeleteProgress: false,
            resubmit: false,
            force: false,
            downstackToSync,
        }, context);
    }));
});
exports.handler = handler;
//# sourceMappingURL=sync.js.map