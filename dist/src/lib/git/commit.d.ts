export declare type TCommitOpts = {
    amend?: boolean;
    allowEmpty?: boolean;
    message?: string;
    noEdit?: boolean;
    rollbackOnError?: () => void;
};
export declare function commit(opts: TCommitOpts & {
    noVerify: boolean;
}): void;
