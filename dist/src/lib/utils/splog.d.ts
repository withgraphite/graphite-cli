export declare type TSplog = {
    newline: () => void;
    info: (msg: string) => void;
    debug: (msg: string) => void;
    error: (msg: string) => void;
    warn: (msg: string) => void;
    message: (msg: string) => void;
    tip: (msg: string) => void;
};
export declare function composeSplog(opts?: {
    quiet?: boolean;
    outputDebugLogs?: boolean;
    tips?: boolean;
}): TSplog;
