import { Argv } from "yargs";

export const command = "repo <command>";
export const desc =
  "Read or write Graphite's configuration settings for the current repo. Run `gp repo --help` to learn more.";

export const builder = function (yargs: Argv): Argv {
  return yargs
    .commandDir("repo-commands", {
      extensions: ["js"],
    })
    .strict()
    .demandCommand();
};
