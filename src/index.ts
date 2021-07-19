#!/usr/bin/env node
import tmp from "tmp";
import yargs from "yargs";
import AmendCommand from "./commands/amend";
import DemoCommand from "./commands/demo";
import DiffCommand from "./commands/diff";
import FeedbackCommand from "./commands/feedback";
import FixCommand from "./commands/fix";
import LogCommand from "./commands/log";
import { NextCommand, PrevCommand } from "./commands/next-or-prev";
import PrintStacksCommand from "./commands/print-stacks";
import RestackCommand from "./commands/restack";
import SubmitCommand from "./commands/submit";
import ValidateCommand from "./commands/validate";

// https://www.npmjs.com/package/tmp#graceful-cleanup
tmp.setGracefulCleanup();

yargs
  .command(
    "next",
    "If you're in a stack: Branch A → Branch B (you are here) → Branch C. Takes you to the next branch (Branch C). If there are two descendent branches, errors out and tells you the various branches you could go to.",
    NextCommand.args,
    async (argv) => {
      await new NextCommand().execute(argv);
    }
  )
  .command(
    "prev",
    "If you're in a stack: Branch A → Branch B (you are here) → Branch C. Takes you to the previous branch (Branch A). If there are two ancestral branches, errors out and tells you the various branches you could go to.",
    PrevCommand.args,
    async (argv) => {
      await new PrevCommand().execute(argv);
    }
  )
  .command(
    "diff",
    "Takes the current changes and creates a new branch off of whatever branch you were previously working on.",
    DiffCommand.args,
    async (argv) => {
      await new DiffCommand().execute(argv);
    }
  )
  .command(
    "amend",
    "Given the current changes, adds it to the current branch (identical to git commit) and restacks anything upstream (see below).",
    AmendCommand.args,
    async (argv) => {
      await new AmendCommand().execute(argv);
    }
  )
  .command("submit", false, SubmitCommand.args, async (argv) => {
    await new SubmitCommand().execute(argv);
  })
  .command(
    "stacks",
    "Prints all current stacks.",
    PrintStacksCommand.args,
    async (argv) => {
      await new PrintStacksCommand().execute(argv);
    }
  )
  .command(
    "log",
    "Prints the current state of the world",
    LogCommand.args,
    async (argv) => {
      await new LogCommand().execute(argv);
    }
  )
  .command(
    "fix",
    "Trace the current branch through its parents, down to the base branch. Establish dependencies between each branch for later traversal and restacking.",
    FixCommand.args,
    async (argv) => {
      await new FixCommand().execute(argv);
    }
  )
  .command(
    "restack",
    "Restacks any dependent branches onto the latest commit in a branch.",
    RestackCommand.args,
    async (argv) => {
      await new RestackCommand().execute(argv);
    }
  )
  .command(
    "validate",
    "Validates that the sd meta graph matches the current graph of git branches and commits.",
    ValidateCommand.args,
    async (argv) => {
      await new ValidateCommand().execute(argv);
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
  .usage(["This CLI helps you manage stacked diffs."].join("\n"))
  .strict()
  .demandCommand().argv;
