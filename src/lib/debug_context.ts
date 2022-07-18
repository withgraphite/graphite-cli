import fs from 'fs-extra';
import path from 'path';
import tmp from 'tmp';
import { TContext } from './context';
import {
  getMetadataRefList,
  readMetadataRef,
  TMeta,
  writeMetadataRef,
} from './engine/metadata_ref';
import {
  deleteBranch,
  getCurrentBranchName,
  switchBranch,
} from './git/branch_ops';
import { getCommitTree } from './git/commit_tree';
import { getShaOrThrow } from './git/get_sha';
import { getBranchNamesAndRevisions } from './git/sorted_branch_names';
import { TRepoConfig } from './spiffy/repo_config_spf';
import { TUserConfig } from './spiffy/user_config_spf';
import { cuteString } from './utils/cute_string';
import { q } from './utils/escape_for_shell';
import { gpExecSync } from './utils/exec_sync';
import { TSplog } from './utils/splog';

type TState = {
  commitTree: Record<string, string[]>;
  userConfig: TUserConfig['data'];
  repoConfig: TRepoConfig['data'];
  branches: Record<string, string>;
  metadata: [string, TMeta][];
  currentBranchName: string | undefined;
};

export function captureState(context: TContext): string {
  const branches = getBranchNamesAndRevisions();
  const state: TState = {
    commitTree: getCommitTree(Object.keys(branches)),
    userConfig: context.userConfig.data,
    repoConfig: context.repoConfig.data,
    branches,
    metadata: Object.keys(getMetadataRefList()).map((branchName) => [
      branchName,
      readMetadataRef(branchName),
    ]),
    currentBranchName: getCurrentBranchName(),
  };

  return cuteString(state);
}

export function recreateState(stateJson: string, splog: TSplog): string {
  const state = JSON.parse(stateJson) as TState;
  const refMappingsOldToNew: Record<string, string> = {};

  splog.info(`Creating repo`);
  const tmpTrunk = `initial-debug-context-head-${Date.now()}`;
  const tmpDir = tmp.dirSync().name;

  const oldDir = process.cwd();
  process.chdir(tmpDir);
  gpExecSync({
    command: [
      `git init -b "${tmpTrunk}"`,
      `echo "first" > first.txt`,
      `git add first.txt`,
      `git commit -m "first"`,
    ].join(' && '),
    onError: 'throw',
  });

  splog.info(`Creating ${Object.keys(state.commitTree).length} commits`);
  recreateCommits({ commitTree: state.commitTree, refMappingsOldToNew }, splog);

  splog.info(`Creating ${Object.keys(state.branches).length} branches`);
  createBranches(
    {
      branches: state.branches,
      refMappingsOldToNew,
    },
    splog
  );

  splog.info(`Creating the repo config`);
  fs.writeFileSync(
    path.join(tmpDir, '/.git/.graphite_repo_config'),
    cuteString(state.repoConfig)
  );

  splog.info(`Creating the metadata`);
  state.metadata.forEach((pair) => {
    const [branchName, meta] = pair;
    // Replace parentBranchRevision with the commit hash in the recreated repo
    if (
      meta.parentBranchRevision &&
      refMappingsOldToNew[meta.parentBranchRevision]
    ) {
      meta.parentBranchRevision =
        refMappingsOldToNew[meta.parentBranchRevision];
    }
    writeMetadataRef(branchName, meta);
  });

  if (state.currentBranchName) {
    switchBranch(state.currentBranchName);
    deleteBranch(tmpTrunk);
  } else {
    splog.warn(`No currentBranchName found, retaining temporary trunk.`);
    switchBranch(tmpTrunk);
  }

  process.chdir(oldDir);
  return tmpDir;
}

function createBranches(
  opts: {
    branches: Record<string, string>;
    refMappingsOldToNew: Record<string, string>;
  },
  splog: TSplog
): void {
  Object.keys(opts.branches).forEach((branch) => {
    const originalRef = opts.refMappingsOldToNew[opts.branches[branch]];
    if (
      branch !=
      gpExecSync({ command: `git branch --show-current`, onError: 'ignore' })
    ) {
      gpExecSync({
        command: `git branch -f ${q(branch)} ${originalRef}`,
        onError: 'throw',
      });
    } else {
      splog.warn(
        `Skipping creating ${branch} which matches the name of the current branch`
      );
    }
  });
}

function recreateCommits(
  opts: {
    commitTree: Record<string, string[]>;
    refMappingsOldToNew: Record<string, string>;
  },
  splog: TSplog
): void {
  const commitsToCreate = [
    ...new Set(Object.values(opts.commitTree).flat()),
  ].filter(
    (ref) =>
      opts.commitTree[ref] === undefined || opts.commitTree[ref].length === 0
  );

  const firstCommitRef = getShaOrThrow('HEAD');
  const treeSha = gpExecSync({
    command: `git cat-file -p HEAD | grep tree | awk '{print $2}'`,
    onError: 'throw',
  });
  const totalOldCommits = Object.keys(opts.commitTree).length;

  while (commitsToCreate.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const originalCommitRef: string = commitsToCreate.shift()!;

    if (originalCommitRef in opts.refMappingsOldToNew) {
      continue;
    }

    // Re-queue the commit if we're still missing one of its parents.
    const originalParents = opts.commitTree[originalCommitRef] || [];
    const missingParent = originalParents.find(
      (p) => opts.refMappingsOldToNew[p] === undefined
    );
    if (missingParent) {
      commitsToCreate.push(originalCommitRef);
      continue;
    }

    const newCommitRef = gpExecSync({
      command: `git commit-tree ${treeSha} -m "${originalCommitRef}" ${
        originalParents.length === 0
          ? `-p ${firstCommitRef}`
          : originalParents
              .map((p) => opts.refMappingsOldToNew[p])
              .map((newParentRef) => `-p ${newParentRef}`)
              .join(' ')
      }`,
      onError: 'throw',
    });

    // Save mapping so we can later associate branches.
    opts.refMappingsOldToNew[originalCommitRef] = newCommitRef;

    const totalNewCommits = Object.keys(opts.refMappingsOldToNew).length;
    if (totalNewCommits % 100 === 0) {
      splog.info(`Progress: ${totalNewCommits} / ${totalOldCommits} created`);
    }

    // Find all commits with this as parent, and enque them for creation.
    Object.keys(opts.commitTree)
      .filter((potentialChildRef) =>
        opts.commitTree[potentialChildRef].includes(originalCommitRef)
      )
      .forEach((child) => {
        commitsToCreate.push(child);
      });
  }
}
