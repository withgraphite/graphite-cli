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
exports.cleanBranchesContinuation = exports.syncAction = void 0;
const preconditions_1 = require("../../lib/preconditions");
const pr_info_1 = require("../../lib/sync/pr_info");
const checkout_branch_1 = require("../../lib/utils/checkout_branch");
const splog_1 = require("../../lib/utils/splog");
const trunk_1 = require("../../lib/utils/trunk");
const branch_1 = require("../../wrapper-classes/branch");
const clean_branches_1 = require("../clean_branches");
const fix_dangling_branches_1 = require("../fix_dangling_branches");
const merge_downstack_1 = require("./merge_downstack");
const prune_remote_branch_metadata_1 = require("./prune_remote_branch_metadata");
const pull_1 = require("./pull");
const resubmit_branches_with_new_bases_1 = require("./resubmit_branches_with_new_bases");
function syncAction(opts, scope, context) {
    return __awaiter(this, void 0, void 0, function* () {
        preconditions_1.uncommittedTrackedChangesPrecondition();
        const oldBranchName = preconditions_1.currentBranchPrecondition(context).name;
        checkout_branch_1.checkoutBranch(trunk_1.getTrunk(context).name, { quiet: true });
        if (opts.pull) {
            pull_1.pull(context, oldBranchName);
            if (opts.pruneRemoteMetadata) {
                yield prune_remote_branch_metadata_1.pruneRemoteBranchMetadata(context, opts.force);
            }
            if (scope.type === 'DOWNSTACK' &&
                (yield merge_downstack_1.mergeDownstack(scope.branchName, context)) === 'ABORT') {
                splog_1.logInfo('Aborting...');
                return;
            }
        }
        yield pr_info_1.syncPRInfoForBranches(branch_1.Branch.allBranches(context), context);
        // This needs to happen before we delete/resubmit so that we can potentially
        // delete or resubmit on the dangling branches.
        if (opts.fixDanglingBranches) {
            yield fix_dangling_branches_1.fixDanglingBranches(context, {
                force: opts.force,
                showSyncTip: true,
            });
        }
        const deleteMergedBranchesContinuation = {
            op: 'REPO_SYNC_CONTINUATION',
            force: opts.force,
            resubmit: opts.resubmit,
            oldBranchName: oldBranchName,
        };
        if (opts.delete) {
            yield clean_branches_1.cleanBranches({
                frame: {
                    op: 'DELETE_BRANCHES_CONTINUATION',
                    force: opts.force,
                    showDeleteProgress: opts.showDeleteProgress,
                },
                parent: [deleteMergedBranchesContinuation],
                showSyncTip: true,
            }, context);
        }
        yield cleanBranchesContinuation(deleteMergedBranchesContinuation, context);
    });
}
exports.syncAction = syncAction;
function cleanBranchesContinuation(frame, context) {
    return __awaiter(this, void 0, void 0, function* () {
        if (frame.resubmit) {
            yield resubmit_branches_with_new_bases_1.resubmitBranchesWithNewBases(frame.force, context);
        }
        checkout_branch_1.checkoutBranch(branch_1.Branch.exists(frame.oldBranchName)
            ? frame.oldBranchName
            : trunk_1.getTrunk(context).name, { quiet: true });
    });
}
exports.cleanBranchesContinuation = cleanBranchesContinuation;
/**
 *
 * Remove for now - users are reporting issues where this is incorrectly
 * deleting metadata for still-existing branches.
 *
 * https://graphite-community.slack.com/archives/C02DRNRA9RA/p1632897956089100
 * https://graphite-community.slack.com/archives/C02DRNRA9RA/p1634168133170500
 *
function cleanDanglingMetadata(): void {
  const allMetadataRefs = MetadataRef.allMetadataRefs();
  allMetadataRefs.forEach((ref) => {
    if (!Branch.exists(ref._branchName)) {
      logDebug(`Deleting metadata for ${ref._branchName}`);
      ref.delete();
    }
  });
}
*/
//# sourceMappingURL=sync.js.map