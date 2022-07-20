export declare const cachePersistenceFactory: {
    load: (filePath?: string | undefined) => {
        readonly data: {} & {
            sha: string;
            branches: ((string | ({
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
            }))))[] & {
                length: number;
            })[];
        };
        readonly update: (mutator: (data: {} & {
            sha: string;
            branches: ((string | ({
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
            }))))[] & {
                length: number;
            })[];
        }) => void) => void;
        readonly path: string;
        delete: () => void;
    };
    loadIfExists: (filePath?: string | undefined) => {
        readonly data: {} & {
            sha: string;
            branches: ((string | ({
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
            }))))[] & {
                length: number;
            })[];
        };
        readonly update: (mutator: (data: {} & {
            sha: string;
            branches: ((string | ({
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
            }))))[] & {
                length: number;
            })[];
        }) => void) => void;
        readonly path: string;
        delete: () => void;
    } | undefined;
};
