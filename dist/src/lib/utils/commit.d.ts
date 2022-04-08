export declare function commit(opts: {
    amend?: boolean;
    allowEmpty?: boolean;
    message?: string;
    noEdit?: boolean;
    rollbackOnError?: () => void;
}): void;
