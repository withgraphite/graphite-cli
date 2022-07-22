import * as t from '@withgraphite/retype';
export declare const prInfoSchema: (value: unknown, opts?: {
    logFailures: boolean;
} | undefined) => value is {
    number?: number | undefined;
    state?: "OPEN" | "CLOSED" | "MERGED" | undefined;
    url?: string | undefined;
    base?: string | undefined;
    body?: string | undefined;
    title?: string | undefined;
    reviewDecision?: "CHANGES_REQUESTED" | "APPROVED" | "REVIEW_REQUIRED" | undefined;
    isDraft?: boolean | undefined;
} & {};
export declare type TBranchPRInfo = t.TypeOf<typeof prInfoSchema>;
declare const metaSchema: (value: unknown, opts?: {
    logFailures: boolean;
} | undefined) => value is {
    parentBranchName?: string | undefined;
    parentBranchRevision?: string | undefined;
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
} & {};
export declare type TMeta = t.TypeOf<typeof metaSchema>;
export declare function writeMetadataRef(branchName: string, meta: TMeta, cwd?: string): void;
export declare function readMetadataRef(branchName: string, cwd?: string): TMeta;
export declare function deleteMetadataRef(branchName: string): void;
export declare function getMetadataRefList(): Record<string, string>;
export {};
