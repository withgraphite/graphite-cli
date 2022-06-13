import { TBranchPRInfo } from './metadata_ref';
export declare type TCachedMeta = {
    children: string[];
    branchRevision: string;
} & ({
    validationResult: 'TRUNK';
} | (({
    validationResult: 'VALID';
    parentBranchName: string;
    parentBranchRevision: string;
} | {
    validationResult: 'INVALID_PARENT';
    parentBranchName: string;
    parentBranchRevision?: string;
} | {
    validationResult: 'BAD_PARENT_REVISION';
    parentBranchName: string;
} | {
    validationResult: 'BAD_PARENT_NAME';
}) & {
    prInfo?: TBranchPRInfo;
}));
declare type TValidCachedMeta = Extract<TCachedMeta, {
    validationResult: 'TRUNK' | 'VALID';
}>;
export declare function assertCachedMetaIsValidOrTrunk(meta: TCachedMeta): asserts meta is TValidCachedMeta;
declare type TNonTrunkCachedMeta = Exclude<TCachedMeta, {
    validationResult: 'TRUNK';
}>;
export declare function assertCachedMetaIsNotTrunk(meta: TCachedMeta): asserts meta is TNonTrunkCachedMeta;
export declare type TValidCachedMetaExceptTrunk = Extract<TValidCachedMeta, TNonTrunkCachedMeta>;
export declare function assertCachedMetaIsValidAndNotTrunk(meta: TCachedMeta): asserts meta is TValidCachedMetaExceptTrunk;
export {};
