export declare type TCommitOpts = {
    amend?: boolean;
    message?: string;
    noEdit?: boolean;
    edit?: boolean;
    patch?: boolean;
    rollbackOnError?: () => void;
};
export declare function commit(opts: TCommitOpts & {
    noVerify: boolean;
}): void;
