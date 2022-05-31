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
exports.editBranchAction = void 0;
const errors_1 = require("../lib/errors");
const rebase_1 = require("../lib/git/rebase");
const preconditions_1 = require("../lib/preconditions");
const fix_1 = require("./fix");
function editBranchAction(context) {
    return __awaiter(this, void 0, void 0, function* () {
        const currentBranch = preconditions_1.currentBranchPrecondition(context);
        const base = currentBranch.getParentBranchSha();
        if (!base) {
            throw new errors_1.PreconditionsFailedError(`Graphite does not have a base revision for this branch; it might have been created with an older version of Graphite.  Please run a 'fix' or 'validate' command in order to backfill this information.`);
        }
        // TODO we will kill this once we cut over to relying on parentRevision for fix
        // If we're checked out on a branch, we're going to perform a stack fix later.
        // In order to allow the stack fix to cut out the old commit, we need to set
        // the prev ref here.
        if (currentBranch !== null) {
            currentBranch.savePrevRef();
        }
        rebase_1.rebaseInteractive({ base, currentBranchName: currentBranch.name }, context);
        yield fix_1.rebaseUpstack(context);
    });
}
exports.editBranchAction = editBranchAction;
//# sourceMappingURL=edit_branch.js.map