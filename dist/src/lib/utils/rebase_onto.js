"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rebaseOnto = void 0;
const cache_1 = require("../config/cache");
const errors_1 = require("../errors");
const exec_sync_1 = require("./exec_sync");
const rebase_in_progress_1 = require("./rebase_in_progress");
const splog_1 = require("./splog");
// TODO migrate mergeBase to use parentRevision of the current branch
function rebaseOnto(args, context) {
    if (args.mergeBase === args.onto.getCurrentRef()) {
        splog_1.logDebug(`No rebase needed for (${args.branch.name}) onto (${args.onto.name}).`);
        return false;
    }
    // TODO can kill this once we are fully migrated to parentRevision
    // Save the old ref from before rebasing so that children can find their bases.
    args.branch.savePrevRef();
    exec_sync_1.gpExecSync({
        command: `git rebase --onto ${args.onto.name} ${args.mergeBase} ${args.branch.name}`,
        options: { stdio: 'ignore' },
    }, (err) => {
        if (rebase_in_progress_1.rebaseInProgress()) {
            throw new errors_1.RebaseConflictError(`Interactive rebase in progress, cannot fix (${args.branch.name}) onto (${args.onto.name}).`, args.mergeConflictCallstack, context);
        }
        else {
            throw new errors_1.ExitFailedError(`Rebase failed when moving (${args.branch.name}) onto (${args.onto.name}).`, err);
        }
    });
    cache_1.cache.clearAll();
    return true;
}
exports.rebaseOnto = rebaseOnto;
//# sourceMappingURL=rebase_onto.js.map