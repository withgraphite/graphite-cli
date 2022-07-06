import * as t from '@withgraphite/retype';
export declare const cachedMetaSchema: (value: unknown, opts?: {
    logFailures: boolean;
} | undefined) => value is {
    prInfo?: ({
        number?: number | undefined;
        state?: "OPEN" | "CLOSED" | "MERGED" | undefined;
        url?: string | undefined;
        base?: string | undefined;
        body?: string | undefined;
        title?: string | undefined;
        reviewDecision?: "CHANGES_REQUESTED" | "APPROVED" | "REVIEW_REQUIRED" | undefined;
        isDraft?: boolean | undefined;
    } & {}) | undefined;
} & {
    children: string[];
    branchRevision: string;
} & (({} & {
    parentBranchName: string;
    parentBranchRevision: string;
    validationResult: "VALID";
}) | ({
    parentBranchRevision?: string | undefined;
} & {
    parentBranchName: string;
    validationResult: "INVALID_PARENT";
}) | ({} & {
    parentBranchName: string;
    validationResult: "BAD_PARENT_REVISION";
}) | ({} & {
    validationResult: "BAD_PARENT_NAME";
}) | ({} & {
    validationResult: "TRUNK";
}));
export declare type TCachedMeta = t.TypeOf<typeof cachedMetaSchema>;
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
