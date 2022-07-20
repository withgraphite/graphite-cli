import { Argv } from 'yargs';
export declare const command = "commit <command>";
export declare const desc = "Commands that operate on commits. Run `gt commit --help` to learn more.";
export declare const aliases: string[];
export declare const builder: (yargs: Argv) => Argv;
