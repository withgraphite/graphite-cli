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
exports.deleteMergedBranches = void 0;
const chalk_1 = __importDefault(require("chalk"));
const child_process_1 = require("child_process");
const prompts_1 = __importDefault(require("prompts"));
const cache_1 = require("../lib/config/cache");
const exec_state_config_1 = require("../lib/config/exec_state_config");
const errors_1 = require("../lib/errors");
const utils_1 = require("../lib/utils");
const merge_base_1 = require("../lib/utils/merge_base");
const delete_branch_1 = require("./delete_branch");
const current_branch_onto_1 = require("./onto/current_branch_onto");
/**
 * This method is assumed to be idempotent -- if a merge conflict interrupts
 * execution of this method, we simply restart the method upon running `gt
 * continue`.
 */
// eslint-disable-next-line max-lines-per-function
function deleteMergedBranches(opts, context) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        utils_1.logInfo(`Checking if any branches have been merged and can be deleted...`);
        if (opts.showSyncTip) {
            utils_1.logTip(`Disable this behavior at any point in the future with --no-delete`, context);
        }
        const trunkChildren = utils_1.getTrunk(context).getChildrenFromMeta(context);
        /**
         * To find and delete all of the merged branches, we traverse all of the
         * stacks off of trunk, greedily deleting the merged-in base branches and
         * rebasing the remaining branches.
         *
         * To greedily delete the branches, we keep track of the branches we plan
         * to delete as well as a live snapshot of their children. When a branch
         * we plan to delete has no more children, we know that it is safe to
         * eagerly delete.
         *
         * This eager deletion doesn't matter much in small repos, but matters
         * a lot if a repo has a lot of branches to delete. Whereas previously
         * any error in `repo sync` would throw away all of the work the command did
         * to determine what could and couldn't be deleted, now we take advantage
         * of that work as soon as we can.
         */
        let toProcess = trunkChildren;
        const branchesToDelete = {};
        /**
         * Since we're doing a DFS, assuming rather even distribution of stacks off
         * of trunk children, we can trace the progress of the DFS through the trunk
         * children to give the user a sense of how far the repo sync has progressed.
         * Note that we only do this if the user has a large number of branches off
         * of trunk (> 50).
         */
        const trunkChildrenProgressMarkers = {};
        if (opts.frame.showDeleteProgress) {
            trunkChildren.forEach((child, i) => {
                // Ignore the first child - don't show 0% progress.
                if (i === 0) {
                    return;
                }
                trunkChildrenProgressMarkers[child.name] = `${+(
                // Add 1 to the overall children length to account for the fact that
                // when we're on the last trunk child, we're not 100% done - we need
                // to go through its stack.
                ((i / (trunkChildren.length + 1)) * 100).toFixed(2))}%`;
            });
        }
        do {
            const branch = toProcess.shift();
            if (branch === undefined) {
                break;
            }
            if (branch.name in branchesToDelete) {
                continue;
            }
            if (opts.frame.showDeleteProgress &&
                branch.name in trunkChildrenProgressMarkers) {
                utils_1.logInfo(`${trunkChildrenProgressMarkers[branch.name]} done searching for merged branches to delete...`);
            }
            const shouldDelete = yield shouldDeleteBranch({
                branch: branch,
                force: opts.frame.force,
            }, context);
            if (shouldDelete) {
                const children = branch.getChildrenFromMeta(context);
                // We concat toProcess to children here (because we shift above) to make
                // our search a DFS.
                toProcess = children.concat(toProcess);
                branchesToDelete[branch.name] = {
                    branch: branch,
                    children: children,
                };
            }
            else {
                const parent = branch.getParentFromMeta(context);
                const parentName = parent === null || parent === void 0 ? void 0 : parent.name;
                // If we've reached this point, we know the branch shouldn't be deleted.
                // This means that we may need to rebase it - if the branch's parent is
                // going to be deleted.
                if (parentName !== undefined && parentName in branchesToDelete) {
                    utils_1.checkoutBranch(branch.name, { quiet: true });
                    utils_1.logInfo(`Stacking (${branch.name}) onto (${utils_1.getTrunk(context).name})...`);
                    current_branch_onto_1.currentBranchOntoAction({
                        onto: utils_1.getTrunk(context).name,
                        mergeConflictCallstack: [opts.frame, ...opts.parent],
                    }, context);
                    branchesToDelete[parentName].children = branchesToDelete[parentName].children.filter((child) => child.name !== branch.name);
                }
            }
            utils_1.checkoutBranch(utils_1.getTrunk(context).name, { quiet: true });
            // With either of the paths above, we may have unblocked a branch that can
            // be deleted immediately. We recursively check whether we can delete a
            // branch (until we can't), because the act of deleting one branch may free
            // up another.
            let branchToDeleteName;
            do {
                branchToDeleteName = Object.keys(branchesToDelete).find((branchToDelete) => branchesToDelete[branchToDelete].children.length === 0);
                if (branchToDeleteName === undefined) {
                    continue;
                }
                const branch = branchesToDelete[branchToDeleteName].branch;
                const parentName = (_a = branch.getParentFromMeta(context)) === null || _a === void 0 ? void 0 : _a.name;
                if (parentName !== undefined && parentName in branchesToDelete) {
                    branchesToDelete[parentName].children = branchesToDelete[parentName].children.filter((child) => child.name !== branch.name);
                }
                deleteBranch(branch, context);
                delete branchesToDelete[branchToDeleteName];
            } while (branchToDeleteName !== undefined);
        } while (toProcess.length > 0);
    });
}
exports.deleteMergedBranches = deleteMergedBranches;
function shouldDeleteBranch(args, context) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        const merged = branchMerged(args.branch, context);
        if (!merged) {
            return false;
        }
        if (args.force) {
            return true;
        }
        else if (!exec_state_config_1.execStateConfig.interactive()) {
            return false;
        }
        const githubMergedBase = ((_a = args.branch.getPRInfo()) === null || _a === void 0 ? void 0 : _a.state) === 'MERGED'
            ? (_b = args.branch.getPRInfo()) === null || _b === void 0 ? void 0 : _b.base
            : undefined;
        // If we've reached this point, we know that the branch was merged - it's
        // just a question of where. If it was merged on GitHub, we see where it was
        // merged into. If we don't detect that it was merged in GitHub but we do
        // see the code in trunk, we fallback to say that it was merged into trunk.
        // This extra check (rather than just saying trunk) is used to catch the
        // case where one feature branch is merged into another on GitHub.
        const mergedBase = githubMergedBase !== null && githubMergedBase !== void 0 ? githubMergedBase : utils_1.getTrunk(context).name;
        const response = yield prompts_1.default({
            type: 'confirm',
            name: 'value',
            message: `Delete (${chalk_1.default.green(args.branch.name)}), which has been merged into (${mergedBase})?`,
            initial: true,
        }, {
            onCancel: () => {
                throw new errors_1.KilledError();
            },
        });
        return response.value === true;
    });
}
function branchMerged(branch, context) {
    var _a;
    const prMerged = ((_a = branch.getPRInfo()) === null || _a === void 0 ? void 0 : _a.state) === 'MERGED';
    if (prMerged) {
        return true;
    }
    const branchName = branch.name;
    const trunk = utils_1.getTrunk(context).name;
    const mergeBase = merge_base_1.getMergeBase(trunk, branchName);
    const cherryCheckProvesMerged = child_process_1.execSync(`git cherry ${trunk} $(git commit-tree $(git rev-parse "${branchName}^{tree}") -p ${mergeBase} -m _)`)
        .toString()
        .trim()
        .startsWith('-');
    if (cherryCheckProvesMerged) {
        return true;
    }
    const diffCheckProvesMerged = child_process_1.execSync(`git diff --no-ext-diff ${branchName} ${trunk} | wc -l`)
        .toString()
        .trim() === '0';
    if (diffCheckProvesMerged) {
        return true;
    }
    return false;
}
function deleteBranch(branch, context) {
    utils_1.logInfo(`Deleting (${chalk_1.default.red(branch.name)})`);
    delete_branch_1.deleteBranchAction({
        branchName: branch.name,
        force: true,
    }, context);
    cache_1.cache.clearAll();
}
//# sourceMappingURL=clean_branches.js.map