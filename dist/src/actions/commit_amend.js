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
exports.commitAmendAction = void 0;
const preconditions_1 = require("../lib/preconditions");
const utils_1 = require("../lib/utils");
const addAll_1 = require("../lib/utils/addAll");
const commit_1 = require("../lib/utils/commit");
const branch_1 = require("../wrapper-classes/branch");
const fix_1 = require("./fix");
function commitAmendAction(opts, context) {
    return __awaiter(this, void 0, void 0, function* () {
        if (opts.addAll) {
            addAll_1.addAll();
        }
        // If we're checked out on a branch, we're going to perform a stack fix later.
        // In order to allow the stack fix to cut out the old commit, we need to set
        // the prev ref here.
        const currentBranch = branch_1.Branch.getCurrentBranch();
        if (currentBranch !== null) {
            currentBranch.setMetaPrevRef(currentBranch.getCurrentRef());
        }
        commit_1.commit({ amend: true, noEdit: opts.noEdit, message: opts.message });
        // Only restack if working tree is now clean.
        try {
            preconditions_1.uncommittedTrackedChangesPrecondition();
            yield fix_1.fixAction({
                action: 'rebase',
                mergeConflictCallstack: [],
            }, context);
        }
        catch (_a) {
            utils_1.logWarn('Cannot fix upstack automatically, some uncommitted changes remain. Please commit or stash, and then `gt stack fix --rebase`');
        }
    });
}
exports.commitAmendAction = commitAmendAction;
//# sourceMappingURL=commit_amend.js.map