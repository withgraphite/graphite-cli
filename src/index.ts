#!/usr/bin/env node
import tmp from "tmp";
import yargs from "yargs";
import DemoCommand from "./commands/original-commands/demo";
import FeedbackCommand from "./commands/original-commands/feedback";
import PrintStacksCommand from "./commands/original-commands/print-stacks";
import SubmitCommand from "./commands/original-commands/submit";

// https://www.npmjs.com/package/tmp#graceful-cleanup
tmp.setGracefulCleanup();

yargs
  .commandDir("commands")
  .command(
    "submit",
    "Experimental: Create PR's for each branch in the current stack",
    SubmitCommand.args,
    async (argv) => {
      await new SubmitCommand().execute(argv);
    }
  )
  .command(
    "stacks",
    "Prints all current stacks.",
    PrintStacksCommand.args,
    async (argv) => {
      await new PrintStacksCommand().execute(argv);
    }
  )
  .command(
    "feedback <message>",
    "Post a string directly to the maintainers' Slack where they can factor in your feedback, laugh at your jokes, cry at your insults, or test the bounds of Slack injection attacks.",
    FeedbackCommand.args,
    async (argv) => {
      await new FeedbackCommand().execute(argv);
    }
  )
  .command("demo", false, DemoCommand.args, async (argv) => {
    await new DemoCommand().execute(argv);
  })
  .help()
  .usage(["This CLI helps you manage stacked diffs."].join("\n"))
  .strict()
  .demandCommand().argv;
