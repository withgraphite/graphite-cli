import { TBranchPRInfo } from './metadata_ref';

export type TCachedMeta = {
  children: string[];
  branchRevision: string;
} & (
  | { validationResult: 'TRUNK' }
  | ((
      | {
          validationResult: 'VALID';
          parentBranchName: string;
          parentBranchRevision: string;
        }
      | {
          validationResult: 'INVALID_PARENT';
          parentBranchName: string;
          parentBranchRevision?: string;
        }
      | {
          validationResult: 'BAD_PARENT_REVISION';
          parentBranchName: string;
        }
      | {
          validationResult: 'BAD_PARENT_NAME';
        }
    ) & {
      prInfo?: TBranchPRInfo;
    })
);

export type TValidCachedMeta = TCachedMeta & {
  validationResult: 'TRUNK' | 'VALID';
};
export type TNonTrunkCachedMeta = Exclude<
  TCachedMeta,
  { validationResult: 'TRUNK' }
>;
export type TValidCachedMetaExceptTrunk = TValidCachedMeta &
  TNonTrunkCachedMeta;
