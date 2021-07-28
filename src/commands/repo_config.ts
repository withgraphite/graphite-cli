import { Argv } from "yargs";

export const command = "repo-config <command>";
export const desc =
  "Read or write Graphite's configuration settings for the current repo.";

export const builder = function (yargs: Argv): Argv {
  return yargs
    .commandDir("repo-config-commands", {
      extensions: ["js"],
    })
    .strict()
    .demandCommand();
};
