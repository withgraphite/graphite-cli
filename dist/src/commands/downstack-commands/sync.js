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
const sync_1 = require("../../actions/sync/sync");
const errors_1 = require("../../lib/errors");
const telemetry_1 = require("../../lib/telemetry");
const args = {
    branch: {
        describe: `Optional branch to sync from`,
        demandOption: false,
        type: 'string',
        positional: true,
    },
};
exports.command = 'sync [branch]';
exports.canonical = 'downstack sync';
exports.description = 'Sync a branch and its downstack from remote.';
exports.builder = args;
const handler = (argv) => __awaiter(void 0, void 0, void 0, function* () {
    return telemetry_1.profile(argv, exports.canonical, (context) => __awaiter(void 0, void 0, void 0, function* () {
        if (!argv.branch) {
            throw new errors_1.ExitFailedError('Remote branch picker not yet implemented');
        }
        yield sync_1.syncAction({
            pull: true,
            force: false,
            resubmit: false,
            delete: false,
            showDeleteProgress: false,
            fixDanglingBranches: false,
            pruneRemoteMetadata: true,
        }, { type: 'DOWNSTACK', branchName: argv.branch }, context);
    }));
});
exports.handler = handler;
//# sourceMappingURL=sync.js.map