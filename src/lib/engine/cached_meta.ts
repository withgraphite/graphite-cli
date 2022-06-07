import { BadTrunkOperationError, UntrackedBranchError } from '../errors';
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

type TValidCachedMeta = Extract<
  TCachedMeta,
  { validationResult: 'TRUNK' | 'VALID' }
>;
export function assertCachedMetaIsValidOrTrunk(
  meta: TCachedMeta
): asserts meta is TValidCachedMeta {
  if (meta.validationResult !== 'VALID' && meta.validationResult !== 'TRUNK') {
    throw new UntrackedBranchError();
  }
}

type TNonTrunkCachedMeta = Exclude<TCachedMeta, { validationResult: 'TRUNK' }>;
export function assertCachedMetaIsNotTrunk(
  meta: TCachedMeta
): asserts meta is TNonTrunkCachedMeta {
  if (meta.validationResult === 'TRUNK') {
    throw new BadTrunkOperationError();
  }
}

export type TValidCachedMetaExceptTrunk = Extract<
  TValidCachedMeta,
  TNonTrunkCachedMeta
>;
export function assertCachedMetaIsValidAndNotTrunk(
  meta: TCachedMeta
): asserts meta is TValidCachedMetaExceptTrunk {
  assertCachedMetaIsValidOrTrunk(meta);
  assertCachedMetaIsNotTrunk(meta);
}
