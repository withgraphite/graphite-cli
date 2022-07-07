import yargs from 'yargs';
declare const args: {
    readonly "use-author-date": {
        readonly demandOption: false;
        readonly type: "boolean";
        readonly describe: string;
    };
};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const command = "restack-date";
export declare const description = "Configure how committer date is handled by restack internal rebases.";
export declare const canonical = "user restack-date";
export declare const builder: {
    readonly "use-author-date": {
        readonly demandOption: false;
        readonly type: "boolean";
        readonly describe: string;
    };
};
export declare const handler: (argv: argsT) => Promise<void>;
export {};
