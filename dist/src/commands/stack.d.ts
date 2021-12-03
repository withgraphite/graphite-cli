import yargs from "yargs";
export declare const command = "stack <command>";
export declare const desc = "Commands that operate on your current stack of branches. Run `gt stack --help` to learn more.";
export declare const aliases: string[];
export declare const builder: (yargs: yargs.Argv<{}>) => yargs.Argv<{}>;
