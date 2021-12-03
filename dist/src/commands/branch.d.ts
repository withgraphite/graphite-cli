import { Argv } from "yargs";
export declare const command = "branch <command>";
export declare const desc = "Commands that operate on your current branch. Run `gt branch --help` to learn more.";
export declare const aliases: string[];
export declare const builder: (yargs: Argv) => Argv;
