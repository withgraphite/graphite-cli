import yargs from 'yargs';
export declare function parseArgs(args: yargs.Arguments): {
    alias: string;
    command: string;
    args: string;
};
