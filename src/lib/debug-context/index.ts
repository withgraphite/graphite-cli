import fs from "fs-extra";
import path from "path";
import tmp from "tmp";
import MetadataRef from "../../wrapper-classes/metadata_ref";
import { repoConfig, userConfig } from "../config";
import { getBranchToRefMapping } from "../git-refs/branch_ref";
import { getRevListGitTree } from "../git-refs/branch_relations";
import { currentBranchPrecondition } from "../preconditions";
import { gpExecSync, logInfo } from "../utils";

type stateT = {
  refTree: Record<string, string[]>;
  branchToRefMapping: Record<string, string>;
  userConfig: string;
  repoConfig: string;
  metadata: Record<string, string>;
};
export function captureState(): string {
  const refTree = getRevListGitTree({
    useMemoizedResults: false,
    direction: "parents",
  });
  const branchToRefMapping = getBranchToRefMapping();

  const metadata: Record<string, string> = {};
  MetadataRef.allMetadataRefs().forEach((ref) => {
    metadata[ref._branchName] = JSON.stringify(ref.read());
  });

  const state: stateT = {
    refTree,
    branchToRefMapping,
    userConfig: JSON.stringify(userConfig._data),
    repoConfig: JSON.stringify(repoConfig._data),
    metadata,
  };

  return JSON.stringify(state, null, 2);
}

export function recreateState(stateJson: string): string {
  const state = JSON.parse(stateJson) as stateT;
  const refMappingsOldToNew: Record<string, string> = {};

  const tmpDir = createTmpGitDir();
  process.chdir(tmpDir);

  logInfo(`Creating ${Object.keys(state.refTree).length} commits`);
  recreateCommits({ refTree: state.refTree, refMappingsOldToNew });

  logInfo(`Creating ${Object.keys(state.branchToRefMapping).length} branches`);
  createBranches({
    branchToRefMapping: state.branchToRefMapping,
    refMappingsOldToNew,
  });

  logInfo(`Creating the repo config`);
  fs.writeFileSync(
    path.join(tmpDir, "/.git/.graphite_repo_config"),
    state.repoConfig
  );

  logInfo(`Creating the metadata`);
  createMetadata({ metadata: state.metadata, tmpDir });

  return tmpDir;
}

function createMetadata(opts: {
  metadata: Record<string, string>;
  tmpDir: string;
}) {
  fs.mkdirSync(`${opts.tmpDir}/.git/refs/branch-metadata`);
  Object.keys(opts.metadata).forEach((branchName) => {
    const metaSha = gpExecSync({
      command: `git hash-object -w --stdin`,
      options: {
        input: opts.metadata[branchName],
      },
    }).toString();
    fs.writeFileSync(
      `${opts.tmpDir}/.git/refs/branch-metadata/${branchName}`,
      metaSha
    );
  });
}

function createBranches(opts: {
  branchToRefMapping: Record<string, string>;
  refMappingsOldToNew: Record<string, string>;
}): void {
  const curBranch = currentBranchPrecondition();
  Object.keys(opts.branchToRefMapping).forEach((branch) => {
    const originalRef =
      opts.refMappingsOldToNew[opts.branchToRefMapping[branch]];
    if (branch != curBranch.name)
      gpExecSync({ command: `git branch -f ${branch} ${originalRef}` });
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
              .join(" ")
      }`,
    })
      .toString()
      .trim();

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

function createTmpGitDir(): string {
  const tmpDir = tmp.dirSync().name;
  logInfo(`Creating tmp repo`);
  gpExecSync({ command: `git -C ${tmpDir} init -b "main"` });
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
  })
    .toString()
    .trim();
}
