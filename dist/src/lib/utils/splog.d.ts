export declare function composeSplog(opts: {
    quiet?: boolean;
    outputDebugLogs?: boolean;
    tips?: boolean;
}): {
    logNewline: () => void;
    logInfo: (msg: string) => void;
    logDebug: (msg: string) => void;
    logError: (msg: string) => void;
    logWarn: (msg: string) => void;
    logMessageFromGraphite: (msg: string) => void;
    logTip: (msg: string) => void;
};
