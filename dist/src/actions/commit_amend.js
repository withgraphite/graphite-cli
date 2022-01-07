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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.commitAmendAction = void 0;
const config_1 = require("../lib/config");
const errors_1 = require("../lib/errors");
const preconditions_1 = require("../lib/preconditions");
const utils_1 = require("../lib/utils");
const branch_1 = __importDefault(require("../wrapper-classes/branch"));
const fix_1 = require("./fix");
function commitAmendAction(opts) {
    return __awaiter(this, void 0, void 0, function* () {
        if (opts.addAll) {
            utils_1.gpExecSync({
                command: 'git add --all',
            }, (err) => {
                throw new errors_1.ExitFailedError('Failed to add changes. Aborting...', err);
            });
        }
        // If we're checked out on a branch, we're going to perform a stack fix later.
        // In order to allow the stack fix to cut out the old commit, we need to set
        // the prev ref here.
        const currentBranch = branch_1.default.getCurrentBranch();
        if (currentBranch !== null) {
            currentBranch.setMetaPrevRef(currentBranch.getCurrentRef());
        }
        utils_1.gpExecSync({
            command: [
                `git commit --amend`,
                ...[
                    opts.noEdit
                        ? ['--no-edit']
                        : opts.message
                            ? [`-m ${opts.message}`]
                            : [],
                ],
                ...[config_1.execStateConfig.noVerify() ? ['--no-verify'] : []],
            ].join(' '),
            options: { stdio: 'inherit' },
        }, (err) => {
            throw new errors_1.ExitFailedError('Failed to amend changes. Aborting...', err);
        });
        // Only restack if working tree is now clean.
        try {
            preconditions_1.uncommittedChangesPrecondition();
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
exports.commitAmendAction = commitAmendAction;
//# sourceMappingURL=commit_amend.js.map