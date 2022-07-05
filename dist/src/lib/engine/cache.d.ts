import { TCommitOpts } from '../git/commit';
import { TCommitFormat } from '../git/commit_range';
import { TSplog } from '../utils/splog';
import { TBranchPRInfo } from './metadata_ref';
import { TScopeSpec } from './scope_spec';
export declare type TMetaCache = {
    debug: () => void;
    persist: () => void;
    clear: () => void;
    reset: (newTrunkName?: string) => void;
    rebuild: (newTrunkName?: string) => void;
    trunk: string;
    isTrunk: (branchName: string) => boolean;
    branchExists(branchName: string | undefined): branchName is string;
    allBranchNames: string[];
    isBranchTracked: (branchName: string) => boolean;
    isViableParent: (branchName: string, parentBranchName: string) => boolean;
    trackBranch: (branchName: string, parentBranchName: string) => void;
    untrackBranch: (branchName: string) => void;
    currentBranch: string | undefined;
    currentBranchPrecondition: string;
    getRevision: (branchName: string) => string;
    getBaseRevision: (branchName: string) => string;
    getAllCommits: (branchName: string, format: TCommitFormat) => string[];
    getPrInfo: (branchName: string) => TBranchPRInfo | undefined;
    upsertPrInfo: (branchName: string, prInfo: Partial<TBranchPRInfo>) => void;
    getChildren: (branchName: string) => string[];
    setParent: (branchName: string, parentBranchName: string) => void;
    getParent: (branchName: string) => string | undefined;
    getParentPrecondition: (branchName: string) => string;
    getRelativeStack: (branchName: string, scope: TScopeSpec) => string[];
    checkoutNewBranch: (branchName: string) => void;
    checkoutBranch: (branchName: string) => void;
    renameCurrentBranch: (branchName: string) => void;
    deleteBranch: (branchName: string) => void;
    commit: (opts: TCommitOpts) => void;
    restackBranch: (branchName: string) => {
        result: 'REBASE_CONFLICT';
        rebasedBranchBase: string;
    } | {
        result: 'REBASE_DONE' | 'REBASE_UNNEEDED';
    };
    rebaseInteractive: (branchName: string) => {
        result: 'REBASE_CONFLICT';
        rebasedBranchBase: string;
    } | {
        result: 'REBASE_DONE';
    };
    continueRebase: (parentBranchRevision: string) => {
        result: 'REBASE_DONE';
        branchName: string;
    } | {
        result: 'REBASE_CONFLICT';
    };
    abortRebase: () => void;
    isMergedIntoTrunk: (branchName: string) => boolean;
    isBranchFixed: (branchName: string) => boolean;
    isBranchEmpty: (branchName: string) => boolean;
    baseMatchesRemoteParent: (branchName: string) => boolean;
    pushBranch: (branchName: string) => void;
    pullTrunk: () => 'PULL_DONE' | 'PULL_UNNEEDED';
    fetchBranch: (branchName: string, parentBranchName: string) => void;
    branchMatchesFetched: (branchName: string) => boolean;
    checkoutBranchFromFetched: (branchName: string, parentBranchName: string) => void;
    rebaseBranchOntoFetched: (branchName: string, parentBranchName: string) => {
        result: 'REBASE_CONFLICT';
        rebasedBranchBase: string;
    } | {
        result: 'REBASE_DONE';
    };
};
export declare function composeMetaCache({ trunkName, currentBranchOverride, splog, noVerify, remote, restackCommitterDateIsAuthorDate, }: {
    trunkName?: string;
    currentBranchOverride?: string;
    splog: TSplog;
    noVerify: boolean;
    remote: string;
    restackCommitterDateIsAuthorDate?: boolean;
}): TMetaCache;
