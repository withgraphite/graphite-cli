import { Argv } from "yargs";

export const command = "branch <command>";
export const desc =
  "Commands that operate on your current branch. Run `gp branch --help` to learn more.";

export const aliases = ["b"];
export const builder = function (yargs: Argv): Argv {
  return yargs
    .commandDir("branch-commands", {
      extensions: ["js"],
    })
    .strict()
    .demandCommand();
};
