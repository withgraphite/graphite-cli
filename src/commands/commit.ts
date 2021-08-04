import { Argv } from "yargs";

export const command = "commit <command>";
export const desc = "Commands that operate on commits";

export const aliases = ["c"];
export const builder = function (yargs: Argv): Argv {
  return yargs
    .commandDir("commit-commands", {
      extensions: ["js"],
    })
    .strict()
    .demandCommand();
};
