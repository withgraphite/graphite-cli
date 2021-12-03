import yargs from "yargs";
export declare const command = "upstack <command>";
export declare const desc = "Commands that operate upstack (inclusive) from your current branch. Run `gt upstack --help` to learn more.";
export declare const aliases: string[];
export declare const builder: (yargs: yargs.Argv<{}>) => yargs.Argv<{}>;
