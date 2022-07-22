export declare type TScopeSpec = {
    recursiveParents?: boolean;
    currentBranch?: boolean;
    recursiveChildren?: boolean;
};
export declare const SCOPE: {
    BRANCH: {
        recursiveParents: false;
        currentBranch: true;
        recursiveChildren: false;
    };
    DOWNSTACK: {
        recursiveParents: true;
        currentBranch: true;
        recursiveChildren: false;
    };
    STACK: {
        recursiveParents: true;
        currentBranch: true;
        recursiveChildren: true;
    };
    UPSTACK: {
        recursiveParents: false;
        currentBranch: true;
        recursiveChildren: true;
    };
    UPSTACK_EXCLUSIVE: {
        recursiveParents: false;
        currentBranch: false;
        recursiveChildren: true;
    };
};
