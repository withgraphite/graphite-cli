#!/usr/bin/env node
import tmp from "tmp";
import yargs from "yargs";

// https://www.npmjs.com/package/tmp#graceful-cleanup
tmp.setGracefulCleanup();

yargs
  .commandDir("commands")
  .command("diff", false, {}, async () => {
    console.log("`gp diff` has been renamed to `gp branch create`");
  })
  .command("fix", false, {}, async () => {
    console.log("`gp fix` has been renamed to `gp stack regen`");
  })
  .command("sync", false, {}, async () => {
    console.log("`gp sync` has been renamed to `gp stack clean`");
  })
  .command("submit", false, {}, async () => {
    console.log("`gp submit` has been renamed to `gp stack submit`");
  })
  .command(
    "amend",
    false,
    { message: { type: "string", demandOption: false } },
    async () => {
      console.log("`gp amend` has been renamed to `gp branch amend`");
    }
  )
  .command("validate", false, {}, async () => {
    console.log("`gp validate` has been renamed to `gp stack validate`");
  })
  .command("prev", false, {}, async () => {
    console.log("`gp prev` has been renamed to `gp branch prev`");
  })
  .command("next", false, {}, async () => {
    console.log("`gp next` has been renamed to `gp branch next`");
  })
  .command(
    "restack",
    false,
    { onto: { type: "string", demandOption: false } },
    async () => {
      console.log("`gp restack` has been renamed to `gp stack fix`");
      console.log("`gp restack --onto` has been renamed to `gp upstack onto`");
    }
  )
  .help()
  .usage(["This CLI helps you manage stacked diffs."].join("\n"))
  .strict()
  .demandCommand().argv;
