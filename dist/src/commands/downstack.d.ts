import yargs from "yargs";
export declare const command = "downstack <command>";
export declare const desc = "Commands that operate upstack (inclusive) from your current branch";
export declare const aliases: string[];
export declare const builder: (yargs: yargs.Argv<{}>) => yargs.Argv<{}>;
