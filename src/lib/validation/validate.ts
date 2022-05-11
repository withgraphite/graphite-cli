import { MetadataRef } from '../../wrapper-classes/metadata_ref';
import { TContext } from '../context';
import { getMergeBase } from '../git/merge_base';
import { logInfo } from '../utils/splog';
import { getTrunk } from '../utils/trunk';

type TParentInfo = { parentName?: string; parentRevision?: string };

type TAllBranchRelations = Map<string, TParentInfo>;

export function validate(context: TContext): void {
  const allBranchRelations: TAllBranchRelations = new Map(
    MetadataRef.allMetadataRefs().map((ref) => {
      const meta = ref.read();
      return [
        ref._branchName,
        {
          parentName: meta?.parentBranchName,
          parentRevision: meta?.parentBranchRevision,
        },
      ];
    })
  );
  allBranchRelations.forEach((value, key) => {
    logInfo(`${key}: ${JSON.stringify(value)}`);
  });

  const trunk = getTrunk(context).name;
  const allBranchNames = new Set([trunk, ...allBranchRelations.keys()]);

  const branchesToValidate = [...allBranchRelations.keys()];
  const validatedBranches = new Set([trunk]);
  const invalidParentName = new Set();
  const invalidParentRevision = new Set();
  const skippedParentInvalid = new Set();

  while (branchesToValidate.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const current = branchesToValidate.shift()!;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const { parentName, parentRevision } = allBranchRelations.get(current)!;

    // First, handle the case where the parent name is invalid
    if (
      !parentName ||
      parentName === current ||
      !allBranchNames.has(parentName)
    ) {
      invalidParentName.add(current);
      continue;
    }

    // If the parent of this branch is invalid, we skip it
    if (
      invalidParentName.has(parentName) ||
      invalidParentRevision.has(parentName) ||
      skippedParentInvalid.has(parentName)
    ) {
      skippedParentInvalid.add(current);
      continue;
    }

    // If parent hasn't been validated yet, we'll come back to this branch
    if (!validatedBranches.has(parentName)) {
      branchesToValidate.push(current);
      continue;
    }

    // If we know the parent is valid, check the parent revision
    if (!parentRevision || !isValidParentRevision(current, parentRevision)) {
      invalidParentRevision.add(current);
      continue;
    }

    // Now we've validated this branch and its parents
    validatedBranches.add(current);
  }

  validatedBranches.forEach((b) => logInfo(`validated: ${b}`));
  invalidParentName.forEach((b) => logInfo(`invalid (parent): ${b}`));
  invalidParentRevision.forEach((b) => logInfo(`invalid (baserev): ${b}`));
  skippedParentInvalid.forEach((b) => logInfo(`skipped (parent): ${b}`));
}

function isValidParentRevision(
  branchName: string,
  parentRevision: string
): boolean {
  return getMergeBase(branchName, parentRevision) === parentRevision;
}
