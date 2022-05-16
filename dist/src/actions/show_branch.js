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
exports.showBranchAction = void 0;
const errors_1 = require("../lib/errors");
const preconditions_1 = require("../lib/preconditions");
const exec_sync_1 = require("../lib/utils/exec_sync");
function showBranchAction(context, opts) {
    return __awaiter(this, void 0, void 0, function* () {
        const currentBranch = preconditions_1.currentBranchPrecondition(context);
        const baseRev = currentBranch.getParentBranchSha();
        if (!baseRev) {
            throw new errors_1.PreconditionsFailedError(`Graphite does not have a base revision for this branch; it might have been created with an older version of Graphite.  Please run a 'fix' or 'validate' command in order to backfill this information.`);
        }
        exec_sync_1.gpExecSync({
            command: `git log ${opts.patch ? '-p' : ''} ${baseRev}.. --`,
            options: { stdio: 'inherit' },
        });
    });
}
exports.showBranchAction = showBranchAction;
//# sourceMappingURL=show_branch.js.map