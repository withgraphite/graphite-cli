export declare const prInfoConfigFactory: {
    load: (filePath?: string | undefined) => {
        readonly data: {} & {
            prInfoToUpsert: ({
                reviewDecision?: "CHANGES_REQUESTED" | "APPROVED" | "REVIEW_REQUIRED" | null | undefined;
            } & {
                state: "OPEN" | "CLOSED" | "MERGED";
                url: string;
                body: string;
                title: string;
                prNumber: number;
                headRefName: string;
                baseRefName: string;
                isDraft: boolean;
            })[];
        };
        readonly update: (mutator: (data: {} & {
            prInfoToUpsert: ({
                reviewDecision?: "CHANGES_REQUESTED" | "APPROVED" | "REVIEW_REQUIRED" | null | undefined;
            } & {
                state: "OPEN" | "CLOSED" | "MERGED";
                url: string;
                body: string;
                title: string;
                prNumber: number;
                headRefName: string;
                baseRefName: string;
                isDraft: boolean;
            })[];
        }) => void) => void;
        readonly path: string;
        delete: () => void;
    };
    loadIfExists: (filePath?: string | undefined) => {
        readonly data: {} & {
            prInfoToUpsert: ({
                reviewDecision?: "CHANGES_REQUESTED" | "APPROVED" | "REVIEW_REQUIRED" | null | undefined;
            } & {
                state: "OPEN" | "CLOSED" | "MERGED";
                url: string;
                body: string;
                title: string;
                prNumber: number;
                headRefName: string;
                baseRefName: string;
                isDraft: boolean;
            })[];
        };
        readonly update: (mutator: (data: {} & {
            prInfoToUpsert: ({
                reviewDecision?: "CHANGES_REQUESTED" | "APPROVED" | "REVIEW_REQUIRED" | null | undefined;
            } & {
                state: "OPEN" | "CLOSED" | "MERGED";
                url: string;
                body: string;
                title: string;
                prNumber: number;
                headRefName: string;
                baseRefName: string;
                isDraft: boolean;
            })[];
        }) => void) => void;
        readonly path: string;
        delete: () => void;
    } | undefined;
};
