import yargs from "yargs";
declare const args: {
    readonly token: {
        readonly type: "string";
        readonly alias: "t";
        readonly describe: "Auth token.";
        readonly demandOption: false;
    };
};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const command = "auth";
export declare const description = "Add your auth token to enable Graphite CLI to create and update your PRs on GitHub. You can get your auth token here: https://app.graphite.dev/activate.";
export declare const builder: {
    readonly token: {
        readonly type: "string";
        readonly alias: "t";
        readonly describe: "Auth token.";
        readonly demandOption: false;
    };
};
export declare const canonical = "auth";
export declare const handler: (argv: argsT) => Promise<void>;
export {};
