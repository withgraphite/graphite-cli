import fs from "fs-extra";
import os from "os";
import path from "path";
import yargs, { Arguments } from "yargs";
import { Branch } from "../wrapper-classes";

const CONFIG_NAME = "current";
const CURRENT = path.join(os.homedir(), CONFIG_NAME);

yargs.completion("completion", (current, argv) => {
  fs.writeFileSync(CURRENT, argv["_"].join(" "));
  const branchArg = getBranchArg(current, argv);
  if (branchArg === null) {
    return;
  }

  return Branch.allBranchesWithFilter({
    filter: (b) => b.name.startsWith(branchArg),
  })
    .map((b) => b.name)
    .sort();
});

/**
 * If the user is entering a branch argument, returns the current entered
 * value. Else, returns null.
 *
 * e.g.
 *
 * gt branch checkout --branch ny--xyz => 'ny--xyz'
 * gt branch checkout --branch => ''
 *
 * gt repo sync => null
 * gt log => null
 */
function getBranchArg(current: string, argv: Arguments): string | null {
  // gt branch checkout --branch <branch_name>
  if (argv["_"].join(" ").includes("branch checkout") && "branch" in argv) {
    // Because --branch is an option on the overall command, we need to check
    // the value of current to make sure that the branch argument is the
    // current argument being entered by the user.
    if (current === "--branch") {
      return "";
    } else if (current === argv["branch"]) {
      return current;
    }
  }

  // gt upstack onto <branch_name>
  if (argv["_"].join(" ").includes("upstack onto")) {
    // Since we're detailing with a positional, we want to make sure that the
    // current argument being entered is in the desired position, i.e. position
    // 4.
    if (argv["_"].length <= 4 && typeof current === "string") {
      return current;
    }
  }

  return null;
}
