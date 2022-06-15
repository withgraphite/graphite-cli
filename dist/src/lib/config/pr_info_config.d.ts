export declare const prInfoConfigFactory: {
    load: (configPath?: string | undefined) => {
        readonly data: {} & {
            prInfoToUpsert: {
                prNumber: number;
                title: string;
                body: string;
                state: "OPEN" | "CLOSED" | "MERGED";
                reviewDecision: "CHANGES_REQUESTED" | "APPROVED" | "REVIEW_REQUIRED" | null | undefined;
                headRefName: string;
                baseRefName: string;
                url: string;
                isDraft: boolean;
            }[];
        };
        readonly update: (mutator: (data: {} & {
            prInfoToUpsert: {
                prNumber: number;
                title: string;
                body: string;
                state: "OPEN" | "CLOSED" | "MERGED";
                reviewDecision: "CHANGES_REQUESTED" | "APPROVED" | "REVIEW_REQUIRED" | null | undefined;
                headRefName: string;
                baseRefName: string;
                url: string;
                isDraft: boolean;
            }[];
        }) => void) => void;
        readonly path: string;
        delete: () => void;
    };
    loadIfExists: (configPath?: string | undefined) => {
        readonly data: {} & {
            prInfoToUpsert: {
                prNumber: number;
                title: string;
                body: string;
                state: "OPEN" | "CLOSED" | "MERGED";
                reviewDecision: "CHANGES_REQUESTED" | "APPROVED" | "REVIEW_REQUIRED" | null | undefined;
                headRefName: string;
                baseRefName: string;
                url: string;
                isDraft: boolean;
            }[];
        };
        readonly update: (mutator: (data: {} & {
            prInfoToUpsert: {
                prNumber: number;
                title: string;
                body: string;
                state: "OPEN" | "CLOSED" | "MERGED";
                reviewDecision: "CHANGES_REQUESTED" | "APPROVED" | "REVIEW_REQUIRED" | null | undefined;
                headRefName: string;
                baseRefName: string;
                url: string;
                isDraft: boolean;
            }[];
        }) => void) => void;
        readonly path: string;
        delete: () => void;
    } | undefined;
};
