import { Argv } from 'yargs';
export declare const aliases: string[];
export declare const command = "repo <command>";
export declare const desc = "Read or write Graphite's configuration settings for the current repo. Run `gt repo --help` to learn more.";
export declare const builder: (yargs: Argv) => Argv;
