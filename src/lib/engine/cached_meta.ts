import * as t from '@withgraphite/retype';
import { BadTrunkOperationError, UntrackedBranchError } from '../errors';
import { prInfoSchema } from './metadata_ref';

export const cachedMetaSchema = t.intersection(
  t.shape({
    children: t.array(t.string),
    branchRevision: t.string,
    prInfo: t.optional(prInfoSchema),
  }),
  t.taggedUnion('validationResult' as const, {
    VALID: {
      validationResult: t.literal('VALID' as const),
      parentBranchName: t.string,
      parentBranchRevision: t.string,
    },
    INVALID_PARENT: {
      validationResult: t.literal('INVALID_PARENT' as const),
      parentBranchName: t.string,
      parentBranchRevision: t.optional(t.string),
    },
    BAD_PARENT_REVISION: {
      validationResult: t.literal('BAD_PARENT_REVISION' as const),
      parentBranchName: t.string,
    },
    BAD_PARENT_NAME: {
      validationResult: t.literal('BAD_PARENT_NAME' as const),
    },
    TRUNK: {
      validationResult: t.literal('TRUNK' as const),
    },
  })
);
export type TCachedMeta = t.TypeOf<typeof cachedMetaSchema>;

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
