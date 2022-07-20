declare const FORMAT: {
    readonly READABLE: "%h - %s";
    readonly SUBJECT: "%s";
    readonly MESSAGE: "%B%n";
    readonly COMMITTER_DATE: "%cr";
    readonly SHA: "%H";
};
export declare type TCommitFormat = keyof typeof FORMAT;
export declare function getCommitRange(base: string | undefined, head: string, format: TCommitFormat): string[];
export {};
