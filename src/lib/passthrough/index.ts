import chalk from "chalk";
import cp from "child_process";
import { logError, logInfo } from "../utils";

const GIT_COMMAND_ALLOWLIST = [
  "status",
  "clone",
  "add",
  "mv",
  "restore",
  "rm",
  "sparse-checkout",
  "bisect",
  "diff",
  "grep",
  "show",
  "status",
  "merge",
  "rebase",
  "reset",
  "switch",
  "tag",
  "fetch",
  "pull",
  "push",
];

export function passthrough(args: string[]): void {
  if (args.length <= 2) {
    return;
  }

  const command = args[2];
  if (!GIT_COMMAND_ALLOWLIST.includes(command)) {
    return;
  }

  logInfo(
    chalk.grey(
      [
        `Command: "${chalk.yellow(
          command
        )}" is not a Graphite command, but is supported by git. Passing command through to git...`,
        `Running: "${chalk.yellow(`git ${args.slice(2).join(" ")}`)}"\n`,
      ].join("\n")
    )
  );

  try {
    cp.spawnSync("git", args.slice(2), { stdio: "inherit" });
  } catch (err: any) {
    logError(err);
    // eslint-disable-next-line no-restricted-syntax
    process.exit(1);
  }
  // eslint-disable-next-line no-restricted-syntax
  process.exit(0);
}
