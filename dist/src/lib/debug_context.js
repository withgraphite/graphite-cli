"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.recreateState = exports.captureState = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const tmp_1 = __importDefault(require("tmp"));
const metadata_ref_1 = require("./engine/metadata_ref");
const commit_tree_1 = require("./git/commit_tree");
const current_branch_name_1 = require("./git/current_branch_name");
const delete_branch_1 = require("./git/delete_branch");
const get_sha_1 = require("./git/get_sha");
const sorted_branch_names_1 = require("./git/sorted_branch_names");
const switch_branch_1 = require("./git/switch_branch");
const cute_string_1 = require("./utils/cute_string");
const escape_for_shell_1 = require("./utils/escape_for_shell");
const exec_sync_1 = require("./utils/exec_sync");
function captureState(context) {
    const branches = (0, sorted_branch_names_1.getBranchNamesAndRevisions)();
    const state = {
        commitTree: (0, commit_tree_1.getCommitTree)(Object.keys(branches)),
        userConfig: context.userConfig.data,
        repoConfig: context.repoConfig.data,
        branches,
        metadata: Object.keys((0, metadata_ref_1.getMetadataRefList)()).map((branchName) => [
            branchName,
            (0, metadata_ref_1.readMetadataRef)(branchName),
        ]),
        currentBranchName: (0, current_branch_name_1.getCurrentBranchName)(),
    };
    return (0, cute_string_1.cuteString)(state);
}
exports.captureState = captureState;
function recreateState(stateJson, splog) {
    const state = JSON.parse(stateJson);
    const refMappingsOldToNew = {};
    splog.info(`Creating repo`);
    const tmpTrunk = `initial-debug-context-head-${Date.now()}`;
    const tmpDir = tmp_1.default.dirSync().name;
    const oldDir = process.cwd();
    process.chdir(tmpDir);
    (0, exec_sync_1.gpExecSync)({
        command: [
            `git init -b "${tmpTrunk}"`,
            `echo "first" > first.txt`,
            `git add first.txt`,
            `git commit -m "first"`,
        ].join(' && '),
    });
    splog.info(`Creating ${Object.keys(state.commitTree).length} commits`);
    recreateCommits({ commitTree: state.commitTree, refMappingsOldToNew }, splog);
    splog.info(`Creating ${Object.keys(state.branches).length} branches`);
    createBranches({
        branches: state.branches,
        refMappingsOldToNew,
    }, splog);
    splog.info(`Creating the repo config`);
    fs_extra_1.default.writeFileSync(path_1.default.join(tmpDir, '/.git/.graphite_repo_config'), (0, cute_string_1.cuteString)(state.repoConfig));
    splog.info(`Creating the metadata`);
    state.metadata.forEach((pair) => {
        const [branchName, meta] = pair;
        // Replace parentBranchRevision with the commit hash in the recreated repo
        if (meta.parentBranchRevision &&
            refMappingsOldToNew[meta.parentBranchRevision]) {
            meta.parentBranchRevision =
                refMappingsOldToNew[meta.parentBranchRevision];
        }
        (0, metadata_ref_1.writeMetadataRef)(branchName, meta);
    });
    if (state.currentBranchName) {
        (0, switch_branch_1.switchBranch)(state.currentBranchName);
        (0, delete_branch_1.deleteBranch)(tmpTrunk);
    }
    else {
        splog.warn(`No currentBranchName found, retaining temporary trunk.`);
        (0, switch_branch_1.switchBranch)(tmpTrunk);
    }
    process.chdir(oldDir);
    return tmpDir;
}
exports.recreateState = recreateState;
function createBranches(opts, splog) {
    Object.keys(opts.branches).forEach((branch) => {
        const originalRef = opts.refMappingsOldToNew[opts.branches[branch]];
        if (branch != (0, exec_sync_1.gpExecSync)({ command: `git branch --show-current` })) {
            (0, exec_sync_1.gpExecSync)({
                command: `git branch -f ${(0, escape_for_shell_1.q)(branch)} ${originalRef}`,
            });
        }
        else {
            splog.warn(`Skipping creating ${branch} which matches the name of the current branch`);
        }
    });
}
function recreateCommits(opts, splog) {
    const commitsToCreate = [
        ...new Set(Object.values(opts.commitTree).flat()),
    ].filter((ref) => opts.commitTree[ref] === undefined || opts.commitTree[ref].length === 0);
    const firstCommitRef = (0, get_sha_1.getShaOrThrow)('HEAD');
    const treeSha = (0, exec_sync_1.gpExecSync)({
        command: `git cat-file -p HEAD | grep tree | awk '{print $2}'`,
    });
    const totalOldCommits = Object.keys(opts.commitTree).length;
    while (commitsToCreate.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const originalCommitRef = commitsToCreate.shift();
        if (originalCommitRef in opts.refMappingsOldToNew) {
            continue;
        }
        // Re-queue the commit if we're still missing one of its parents.
        const originalParents = opts.commitTree[originalCommitRef] || [];
        const missingParent = originalParents.find((p) => opts.refMappingsOldToNew[p] === undefined);
        if (missingParent) {
            commitsToCreate.push(originalCommitRef);
            continue;
        }
        const newCommitRef = (0, exec_sync_1.gpExecSync)({
            command: `git commit-tree ${treeSha} -m "${originalCommitRef}" ${originalParents.length === 0
                ? `-p ${firstCommitRef}`
                : originalParents
                    .map((p) => opts.refMappingsOldToNew[p])
                    .map((newParentRef) => `-p ${newParentRef}`)
                    .join(' ')}`,
        });
        // Save mapping so we can later associate branches.
        opts.refMappingsOldToNew[originalCommitRef] = newCommitRef;
        const totalNewCommits = Object.keys(opts.refMappingsOldToNew).length;
        if (totalNewCommits % 100 === 0) {
            splog.info(`Progress: ${totalNewCommits} / ${totalOldCommits} created`);
        }
        // Find all commits with this as parent, and enque them for creation.
        Object.keys(opts.commitTree)
            .filter((potentialChildRef) => opts.commitTree[potentialChildRef].includes(originalCommitRef))
            .forEach((child) => {
            commitsToCreate.push(child);
        });
    }
}
//# sourceMappingURL=debug_context.js.map