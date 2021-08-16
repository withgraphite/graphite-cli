import { Argv } from "yargs";

export const command = "commit <command>";
export const desc =
  "Commands that operate on commits. Run `gt commit --help` to learn more.";

export const aliases = ["c"];
export const builder = function (yargs: Argv): Argv {
  return yargs
    .commandDir("commit-commands", {
      extensions: ["js"],
    })
    .strict()
    .demandCommand();
};
