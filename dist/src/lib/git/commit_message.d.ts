declare const GIT_LOG_FORMAT: {
    BODY: "%b";
    SUBJECT: "%s";
};
export declare function getCommitMessage(sha: string, format: keyof typeof GIT_LOG_FORMAT): string;
export {};
