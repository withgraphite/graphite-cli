import yargs from 'yargs';
declare const args: {
    readonly message: {
        readonly type: "string";
        readonly positional: true;
        readonly demandOption: true;
        readonly describe: "Positive or constructive feedback for the Graphite team! Jokes are chill too.";
    };
    readonly 'with-debug-context': {
        readonly type: "boolean";
        readonly default: false;
        readonly describe: "Include a blob of json describing your repo's state to help with debugging. Run 'gt feedback debug-context' to see what would be included.";
    };
};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const command = "* <message>";
export declare const canonical = "feedback";
export declare const description = "Post a string directly to the maintainers' Slack where they can factor in your feedback, laugh at your jokes, cry at your insults, or test the bounds of Slack injection attacks.";
export declare const builder: {
    readonly message: {
        readonly type: "string";
        readonly positional: true;
        readonly demandOption: true;
        readonly describe: "Positive or constructive feedback for the Graphite team! Jokes are chill too.";
    };
    readonly 'with-debug-context': {
        readonly type: "boolean";
        readonly default: false;
        readonly describe: "Include a blob of json describing your repo's state to help with debugging. Run 'gt feedback debug-context' to see what would be included.";
    };
};
export declare const handler: (argv: argsT) => Promise<void>;
export {};
