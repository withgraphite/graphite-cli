import { Argv } from "yargs";
export declare const command = "user <command>";
export declare const desc = "Read or write Graphite's user configuration settings. Run `gt user --help` to learn more.";
export declare const builder: (yargs: Argv) => Argv;
