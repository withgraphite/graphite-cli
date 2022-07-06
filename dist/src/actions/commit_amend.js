"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commitAmendAction = void 0;
const scope_spec_1 = require("../lib/engine/scope_spec");
const add_all_1 = require("../lib/git/add_all");
const preconditions_1 = require("../lib/preconditions");
const restack_1 = require("./restack");
function commitAmendAction(opts, context) {
    if (opts.addAll) {
        (0, add_all_1.addAll)();
    }
    if (opts.noEdit) {
        (0, preconditions_1.ensureSomeStagedChangesPrecondition)(context);
    }
    context.metaCache.commit({
        amend: true,
        noEdit: opts.noEdit,
        message: opts.message,
    });
    if (!opts.noEdit) {
        context.splog.tip('In the future, you can skip editing the commit message with the `--no-edit` flag.');
    }
    (0, restack_1.restackBranches)(context.metaCache.getRelativeStack(context.metaCache.currentBranchPrecondition, scope_spec_1.SCOPE.UPSTACK_EXCLUSIVE), context);
}
exports.commitAmendAction = commitAmendAction;
//# sourceMappingURL=commit_amend.js.map