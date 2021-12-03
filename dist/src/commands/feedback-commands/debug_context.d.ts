import yargs from "yargs";
declare const args: {
    readonly recreate: {
        readonly type: "string";
        readonly optional: true;
        readonly alias: "r";
        readonly describe: "Accepts a json block created by `gt feedback state`. Recreates a debug repo in a temp folder with a commit tree matching the state JSON.";
    };
    readonly "recreate-from-file": {
        readonly type: "string";
        readonly optional: true;
        readonly alias: "f";
        readonly describe: "Accepts a file containing a json block created by `gt feedback state`. Recreates a debug repo in a temp folder with a commit tree matching the state JSON.";
    };
};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const command = "debug-context";
export declare const canonical = "feedback debug-context";
export declare const description = "Print a debug summary of your repo. Useful for creating bug report details.";
export declare const builder: {
    readonly recreate: {
        readonly type: "string";
        readonly optional: true;
        readonly alias: "r";
        readonly describe: "Accepts a json block created by `gt feedback state`. Recreates a debug repo in a temp folder with a commit tree matching the state JSON.";
    };
    readonly "recreate-from-file": {
        readonly type: "string";
        readonly optional: true;
        readonly alias: "f";
        readonly describe: "Accepts a file containing a json block created by `gt feedback state`. Recreates a debug repo in a temp folder with a commit tree matching the state JSON.";
    };
};
export declare const handler: (argv: argsT) => Promise<void>;
export {};
