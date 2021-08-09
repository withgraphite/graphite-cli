import yargs from "yargs";

export const command = "stack <command>";
export const desc =
  "Commands that operate on your current stack of branches. Run `gp stack --help` to learn more.";
export const aliases = ["s"];
export const builder = function (yargs: yargs.Argv): yargs.Argv {
  return yargs
    .commandDir("stack-commands", {
      extensions: ["js"],
    })
    .strict()
    .demandCommand();
};
