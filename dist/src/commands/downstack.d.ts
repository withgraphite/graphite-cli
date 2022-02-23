import yargs from 'yargs';
export declare const command = "downstack <command>";
export declare const desc = "Commands that operate downstack (inclusive) from your current branch. Run `gt downstack --help` to learn more.";
export declare const aliases: string[];
export declare const builder: (yargs: yargs.Argv<{}>) => yargs.Argv<{}>;
