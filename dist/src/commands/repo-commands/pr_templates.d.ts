import yargs from 'yargs';
declare const args: {};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const command = "pr-templates";
export declare const canonical = "repo pr-templates";
export declare const description = "A list of your GitHub PR templates. These are used to pre-fill the bodies of your PRs created using the submit command.";
export declare const builder: {};
export declare const handler: (argv: argsT) => Promise<void>;
export {};
