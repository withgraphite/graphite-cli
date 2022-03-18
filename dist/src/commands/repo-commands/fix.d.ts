import yargs from 'yargs';
import { TRepoFixBranchCountSanityCheckStackFrame } from '../../lib/config/merge_conflict_callstack_config';
declare const args: {
    readonly force: {
        readonly describe: "Don't prompt you to confirm whether to take a remediation (may include deleting already-merged branches and setting branch parents).";
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly alias: "f";
    };
    readonly 'show-delete-progress': {
        readonly describe: "Show progress through merged branches.";
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
    };
};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const command = "fix";
export declare const canonical = "repo fix";
export declare const description = "Search for and remediate common problems in your repo that slow Graphite down and/or cause bugs (e.g. stale branches, branches with unknown parents).";
export declare const builder: {
    readonly force: {
        readonly describe: "Don't prompt you to confirm whether to take a remediation (may include deleting already-merged branches and setting branch parents).";
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly alias: "f";
    };
    readonly 'show-delete-progress': {
        readonly describe: "Show progress through merged branches.";
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
    };
};
export declare const handler: (argv: argsT) => Promise<void>;
export declare function branchCountSanityCheckContinuation(frame: TRepoFixBranchCountSanityCheckStackFrame): Promise<void>;
export {};
