export declare function commit(opts: {
    amend?: boolean;
    allowEmpty?: boolean;
    message?: string;
    noEdit?: boolean;
    noVerify: boolean;
    rollbackOnError?: () => void;
}): void;
