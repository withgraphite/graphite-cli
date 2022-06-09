import { TSplog } from '../utils/splog';
import { TCachedMeta } from './cached_meta';
import { TMeta } from './metadata_ref';
declare type TBranchToParse = {
    branchName: string;
    branchRevision: string;
} & TMeta;
export declare function parseBranchesAndMeta(args: {
    pruneMeta?: boolean;
    gitBranchNamesAndRevisions: Record<string, string>;
    metaRefNames: string[];
    trunkName: string | undefined;
}, splog: TSplog): Record<string, TCachedMeta>;
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
