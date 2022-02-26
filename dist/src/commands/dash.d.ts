import yargs from 'yargs';
export declare const command = "dash <command>";
export declare const desc = "Open the web dashboard.";
export declare const builder: (yargs: yargs.Argv<{}>) => yargs.Argv<{}>;
