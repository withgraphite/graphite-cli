declare const FORMAT: {
    readonly SHA: "%H";
    readonly READABLE: "%h - %s";
};
export declare type TCommitFormat = keyof typeof FORMAT;
export declare function getCommitRange(base: string, head: string, format: TCommitFormat): string[];
export {};
