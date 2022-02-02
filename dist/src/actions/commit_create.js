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
exports.commitCreateAction = void 0;
const config_1 = require("../lib/config");
const errors_1 = require("../lib/errors");
const preconditions_1 = require("../lib/preconditions");
const utils_1 = require("../lib/utils");
const fix_1 = require("./fix");
function commitCreateAction(opts) {
    return __awaiter(this, void 0, void 0, function* () {
        if (opts.addAll) {
            utils_1.gpExecSync({
                command: 'git add --all',
            }, (err) => {
                throw new errors_1.ExitFailedError('Failed to add changes. Aborting...', err);
            });
        }
        preconditions_1.ensureSomeStagedChangesPrecondition();
        if (opts.message !== undefined) {
            utils_1.gpExecSync({
                command: [
                    'git commit',
                    `-m "${opts.message}"`,
                    ...[config_1.execStateConfig.noVerify() ? ['--no-verify'] : []],
                ].join(' '),
            }, (err) => {
                throw new errors_1.ExitFailedError('Failed to commit changes. Aborting...', err);
            });
        }
        else {
            utils_1.gpExecSync({
                command: [
                    'git commit',
                    ...[config_1.execStateConfig.noVerify() ? ['--no-verify'] : []],
                ].join(' '),
                options: {
                    stdio: 'inherit',
                },
            }, (err) => {
                throw new errors_1.ExitFailedError('Failed to commit changes. Aborting...', err);
            });
        }
        try {
            preconditions_1.uncommittedTrackedChangesPrecondition();
            yield fix_1.fixAction({
                action: 'rebase',
                mergeConflictCallstack: 'TOP_OF_CALLSTACK_WITH_NOTHING_AFTER',
            });
        }
        catch (_a) {
            utils_1.logWarn('Cannot fix upstack automatically, some uncommitted changes remain. Please commit or stash, and then `gt stack fix --rebase`');
        }
    });
}
exports.commitCreateAction = commitCreateAction;
//# sourceMappingURL=commit_create.js.map