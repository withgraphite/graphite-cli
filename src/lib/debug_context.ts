import fs from 'fs-extra';
import path from 'path';
import tmp from 'tmp';
import { MetadataRef, TMeta } from '../wrapper-classes/metadata_ref';
import { TContext } from './context';
import { getBranchToRefMapping } from './git-refs/branch_ref';
import { getRevListGitTree } from './git-refs/branch_relations';
import { switchBranch } from './git/checkout_branch';
import { deleteBranch } from './git/deleteBranch';
import { currentBranchPrecondition } from './preconditions';
import { gpExecSync } from './utils/exec_sync';

type TState = {
  refTree: Record<string, string[]>;
  branchToRefMapping: Record<string, string>;
  userConfig: string;
  repoConfig: string;
  metadata: Record<string, string>;
  currentBranchName: string;
};
export function captureState(context: TContext): string {
  const refTree = getRevListGitTree(
    {
      useMemoizedResults: false,
      direction: 'parents',
    },
    context
  );
  const branchToRefMapping = getBranchToRefMapping();

  const metadata: Record<string, string> = {};
  MetadataRef.allMetadataRefs().forEach((ref) => {
    metadata[ref._branchName] = JSON.stringify(ref.read());
  });

  const currentBranchName = currentBranchPrecondition().name;

  const state: TState = {
    refTree,
    branchToRefMapping,
    userConfig: JSON.stringify(context.userConfig.data),
    repoConfig: JSON.stringify(context.repoConfig.data),
    metadata,
    currentBranchName,
  };

  return JSON.stringify(state, null, 2);
}

export function recreateState(stateJson: string, context: TContext): string {
  const state = JSON.parse(stateJson) as TState;
  const refMappingsOldToNew: Record<string, string> = {};

  const tmpTrunk = `initial-debug-context-head-${Date.now()}`;
  const tmpDir = createTmpGitDir({
    trunkName: tmpTrunk,
  });
  process.chdir(tmpDir);

  context.splog.logInfo(
    `Creating ${Object.keys(state.refTree).length} commits`
  );
  recreateCommits({ refTree: state.refTree, refMappingsOldToNew });

  context.splog.logInfo(
    `Creating ${Object.keys(state.branchToRefMapping).length} branches`
  );

  const curBranch = currentBranchPrecondition();
  Object.keys(state.branchToRefMapping).forEach((branch) => {
    const originalRef = refMappingsOldToNew[state.branchToRefMapping[branch]];
    if (branch != curBranch.name) {
      gpExecSync({ command: `git branch -f ${branch} ${originalRef}` });
    } else {
      context.splog.logWarn(
        `Skipping creating ${branch} which matches the name of the current branch`
      );
    }
  });
  context.splog.logInfo(`Creating the repo config`);
  fs.writeFileSync(
    path.join(tmpDir, '/.git/.graphite_repo_config'),
    state.repoConfig
  );

  context.splog.logInfo(`Creating the metadata`);
  createMetadata({ metadata: state.metadata, tmpDir, refMappingsOldToNew });

  switchBranch(state.currentBranchName);
  deleteBranch(tmpTrunk);

  return tmpDir;
}

function createMetadata(opts: {
  metadata: Record<string, string>;
  refMappingsOldToNew: Record<string, string>;
  tmpDir: string;
}) {
  fs.mkdirSync(`${opts.tmpDir}/.git/refs/branch-metadata`);
  Object.keys(opts.metadata).forEach((branchName) => {
    // Replace parentBranchRevision with the commit hash in the recreated repo
    const meta: TMeta = JSON.parse(opts.metadata[branchName]);
    if (
      meta.parentBranchRevision &&
      opts.refMappingsOldToNew[meta.parentBranchRevision]
    ) {
      meta.parentBranchRevision =
        opts.refMappingsOldToNew[meta.parentBranchRevision];
    }
    const metaSha = gpExecSync({
      command: `git hash-object -w --stdin`,
      options: {
        input: JSON.stringify(meta),
      },
    });
    fs.writeFileSync(
      `${opts.tmpDir}/.git/refs/branch-metadata/${branchName}`,
      metaSha
    );
  });
}

function recreateCommits(opts: {
  refTree: Record<string, string[]>;
  refMappingsOldToNew: Record<string, string>;
}): void {
  const treeObjectId = getTreeObjectId();
  const commitsToCreate: string[] = commitRefsWithNoParents(opts.refTree);
  const firstCommitRef = gpExecSync({ command: `git rev-parse HEAD` });
  const totalOldCommits = Object.keys(opts.refTree).length;

  while (commitsToCreate.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const originalCommitRef: string = commitsToCreate.shift()!;

    if (originalCommitRef in opts.refMappingsOldToNew) {
      continue;
    }

    // Re-queue the commit if we're still missing one of its parents.
    const originalParents = opts.refTree[originalCommitRef] || [];
    const missingParent = originalParents.find(
      (p) => opts.refMappingsOldToNew[p] === undefined
    );
    if (missingParent) {
      commitsToCreate.push(originalCommitRef);
      continue;
    }

    const newCommitRef = gpExecSync({
      command: `git commit-tree ${treeObjectId} -m "${originalCommitRef}" ${
        originalParents.length === 0
          ? `-p ${firstCommitRef}`
          : originalParents
              .map((p) => opts.refMappingsOldToNew[p])
              .map((newParentRef) => `-p ${newParentRef}`)
              .join(' ')
      }`,
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

function createTmpGitDir(opts?: { trunkName?: string }): string {
  const tmpDir = tmp.dirSync().name;
  console.log(`Creating tmp repo`);
  gpExecSync({
    command: `git -C ${tmpDir} init -b "${opts?.trunkName ?? 'main'}"`,
  });
  gpExecSync({
    command: `cd ${tmpDir} && echo "first" > first.txt && git add first.txt && git commit -m "first"`,
  });
  return tmpDir;
}

function commitRefsWithNoParents(refTree: Record<string, string[]>): string[] {
  // Create commits for each ref
  const allRefs: string[] = [
    ...new Set(Object.keys(refTree).concat.apply([], Object.values(refTree))),
  ];
  return allRefs.filter(
    (ref) => refTree[ref] === undefined || refTree[ref].length === 0
  );
}

function getTreeObjectId(): string {
  return gpExecSync({
    command: `git cat-file -p HEAD | grep tree | awk '{print $2}'`,
  });
}
