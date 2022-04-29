import yargs from 'yargs';
export declare const command = "log <command>";
export declare const desc = "Commands that log your stacks.";
export declare const aliases: string[];
export declare const builder: (yargs: yargs.Argv<{}>) => yargs.Argv<{}>;
