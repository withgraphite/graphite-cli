import { branchNamesAndRevisions } from '../git/sorted_branch_names';
import { TSplog } from '../utils/splog';
import {
  allBranchesWithMeta,
  deleteMetadataRef,
  readMetadataRef,
  TMeta,
} from './metadata_ref';

export type TBranchToParse = {
  branchName: string;
  branchRevision: string;
} & TMeta;
export function getAllBranchesAndMeta(
  splog: TSplog,
  pruneMeta?: boolean
): TBranchToParse[] {
  const gitBranchNamesAndRevisions = branchNamesAndRevisions();

  const branchesWithMeta = new Set(
    allBranchesWithMeta().filter((branchName) => {
      if (gitBranchNamesAndRevisions[branchName]) {
        return true;
      }
      if (!pruneMeta) {
        return false;
      }
      // Clean up refs whose branch is missing
      splog.logDebug(`Deleting metadata for missing branch: ${branchName}`);
      deleteMetadataRef(branchName);
      return false;
    })
  );

  return Object.keys(gitBranchNamesAndRevisions).map((branchName) => ({
    branchName,
    branchRevision: gitBranchNamesAndRevisions[branchName],
    ...(branchesWithMeta.has(branchName) ? readMetadataRef(branchName) : {}),
  }));
}
