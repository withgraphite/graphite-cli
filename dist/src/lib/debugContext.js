"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.recreateState = exports.captureState = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const tmp_1 = __importDefault(require("tmp"));
const metadata_ref_1 = require("../wrapper-classes/metadata_ref");
const branch_ref_1 = require("./git-refs/branch_ref");
const branch_relations_1 = require("./git-refs/branch_relations");
const checkout_branch_1 = require("./git/checkout_branch");
const deleteBranch_1 = require("./git/deleteBranch");
const preconditions_1 = require("./preconditions");
const exec_sync_1 = require("./utils/exec_sync");
function captureState(context) {
    const refTree = branch_relations_1.getRevListGitTree({
        useMemoizedResults: false,
        direction: 'parents',
    }, context);
    const branchToRefMapping = branch_ref_1.getBranchToRefMapping(context);
    const metadata = {};
    metadata_ref_1.MetadataRef.allMetadataRefs().forEach((ref) => {
        metadata[ref._branchName] = JSON.stringify(ref.read());
    });
    const currentBranchName = preconditions_1.currentBranchPrecondition(context).name;
    const state = {
        refTree,
        branchToRefMapping,
        userConfig: JSON.stringify(context.userConfig.data),
        repoConfig: JSON.stringify(context.repoConfig.data),
        metadata,
        currentBranchName,
    };
    return JSON.stringify(state, null, 2);
}
exports.captureState = captureState;
function recreateState(stateJson, context) {
    const state = JSON.parse(stateJson);
    const refMappingsOldToNew = {};
    const tmpTrunk = `initial-debug-context-head-${Date.now()}`;
    const tmpDir = createTmpGitDir({
        trunkName: tmpTrunk,
    });
    process.chdir(tmpDir);
    context.splog.logInfo(`Creating ${Object.keys(state.refTree).length} commits`);
    recreateCommits({ refTree: state.refTree, refMappingsOldToNew });
    context.splog.logInfo(`Creating ${Object.keys(state.branchToRefMapping).length} branches`);
    createBranches({
        branchToRefMapping: state.branchToRefMapping,
        refMappingsOldToNew,
    }, context);
    context.splog.logInfo(`Creating the repo config`);
    fs_extra_1.default.writeFileSync(path_1.default.join(tmpDir, '/.git/.graphite_repo_config'), state.repoConfig);
    context.splog.logInfo(`Creating the metadata`);
    createMetadata({ metadata: state.metadata, tmpDir });
    checkout_branch_1.checkoutBranch(state.currentBranchName);
    deleteBranch_1.deleteBranch(tmpTrunk);
    return tmpDir;
}
exports.recreateState = recreateState;
function createMetadata(opts) {
    fs_extra_1.default.mkdirSync(`${opts.tmpDir}/.git/refs/branch-metadata`);
    Object.keys(opts.metadata).forEach((branchName) => {
        const metaSha = exec_sync_1.gpExecSync({
            command: `git hash-object -w --stdin`,
            options: {
                input: opts.metadata[branchName],
            },
        });
        fs_extra_1.default.writeFileSync(`${opts.tmpDir}/.git/refs/branch-metadata/${branchName}`, metaSha);
    });
}
function createBranches(opts, context) {
    const curBranch = preconditions_1.currentBranchPrecondition(context);
    Object.keys(opts.branchToRefMapping).forEach((branch) => {
        const originalRef = opts.refMappingsOldToNew[opts.branchToRefMapping[branch]];
        if (branch != curBranch.name) {
            exec_sync_1.gpExecSync({ command: `git branch -f ${branch} ${originalRef}` });
        }
        else {
            context.splog.logWarn(`Skipping creating ${branch} which matches the name of the current branch`);
        }
    });
}
function recreateCommits(opts) {
    const treeObjectId = getTreeObjectId();
    const commitsToCreate = commitRefsWithNoParents(opts.refTree);
    const firstCommitRef = exec_sync_1.gpExecSync({ command: `git rev-parse HEAD` });
    const totalOldCommits = Object.keys(opts.refTree).length;
    while (commitsToCreate.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const originalCommitRef = commitsToCreate.shift();
        if (originalCommitRef in opts.refMappingsOldToNew) {
            continue;
        }
        // Re-queue the commit if we're still missing one of its parents.
        const originalParents = opts.refTree[originalCommitRef] || [];
        const missingParent = originalParents.find((p) => opts.refMappingsOldToNew[p] === undefined);
        if (missingParent) {
            commitsToCreate.push(originalCommitRef);
            continue;
        }
        const newCommitRef = exec_sync_1.gpExecSync({
            command: `git commit-tree ${treeObjectId} -m "${originalCommitRef}" ${originalParents.length === 0
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
            console.log(`Progress: ${totalNewCommits} / ${totalOldCommits} created`);
        }
        // Find all commits with this as parent, and enque them for creation.
        Object.keys(opts.refTree).forEach((potentialChildRef) => {
            const parents = opts.refTree[potentialChildRef];
            if (parents.includes(originalCommitRef)) {
                commitsToCreate.push(potentialChildRef);
            }
        });
    }
}
function createTmpGitDir(opts) {
    var _a;
    const tmpDir = tmp_1.default.dirSync().name;
    console.log(`Creating tmp repo`);
    exec_sync_1.gpExecSync({
        command: `git -C ${tmpDir} init -b "${(_a = opts === null || opts === void 0 ? void 0 : opts.trunkName) !== null && _a !== void 0 ? _a : 'main'}"`,
    });
    exec_sync_1.gpExecSync({
        command: `cd ${tmpDir} && echo "first" > first.txt && git add first.txt && git commit -m "first"`,
    });
    return tmpDir;
}
function commitRefsWithNoParents(refTree) {
    // Create commits for each ref
    const allRefs = [
        ...new Set(Object.keys(refTree).concat.apply([], Object.values(refTree))),
    ];
    return allRefs.filter((ref) => refTree[ref] === undefined || refTree[ref].length === 0);
}
function getTreeObjectId() {
    return exec_sync_1.gpExecSync({
        command: `git cat-file -p HEAD | grep tree | awk '{print $2}'`,
    });
}
//# sourceMappingURL=debugContext.js.map