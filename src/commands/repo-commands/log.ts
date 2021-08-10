import { Argv } from "yargs";

export const command = "log <command>";
export const desc = "Configuration settings for the Graphite log command.";

export const builder = function (yargs: Argv): Argv {
  return yargs
    .commandDir("log-settings", {
      extensions: ["js"],
    })
    .strict()
    .demandCommand();
};
