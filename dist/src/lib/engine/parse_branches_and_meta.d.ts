import { TSplog } from '../utils/splog';
import { TCachedMeta } from './cached_meta';
import { TMeta } from './metadata_ref';
declare type TBranchToParse = {
    branchName: string;
    branchRevision: string;
} & TMeta;
export declare type TCacheSeed = {
    trunkName: string | undefined;
    gitBranchNamesAndRevisions: Record<string, string>;
    metadataRefList: Record<string, string>;
};
export declare function parseBranchesAndMeta(args: TCacheSeed, splog: TSplog): Record<string, TCachedMeta>;
declare type TBranchToParseWithValidatedParent = TBranchToParse & {
    parentBranchName: string;
    parentBranchCurrentRevision: string;
};
export declare function validateOrFixParentBranchRevision({ branchName, parentBranchName, parentBranchRevision, prInfo, parentBranchCurrentRevision, }: TBranchToParseWithValidatedParent, splog: TSplog): {
    validationResult: 'VALID';
    parentBranchRevision: string;
} | {
    validationResult: 'BAD_PARENT_REVISION';
};
export {};
