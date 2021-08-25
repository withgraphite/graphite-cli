import { execStateConfig, userConfig } from "../lib/config";
import { ExitFailedError } from "../lib/errors";
import {
  currentBranchPrecondition,
  ensureSomeStagedChangesPrecondition,
} from "../lib/preconditions";
import { checkoutBranch, gpExecSync, logTip } from "../lib/utils";
import Branch from "../wrapper-classes/branch";

export async function createBranchAction(opts: {
  branchName?: string;
  commitMessage?: string;
  addAll?: boolean
}): Promise<void> {
  const parentBranch = currentBranchPrecondition();

  if (opts.addAll) {
    gpExecSync(
        {
          command: "git add --all",
        },
        () => {
          throw new ExitFailedError("Could not add all staged changes. Aborting...");
        }
    );
  }

  if (opts.commitMessage) {
    ensureSomeStagedChangesPrecondition("Use -a option to stage all unstaged changes.");
  }

  const branchName = newBranchName(opts.branchName, opts.commitMessage);
  checkoutNewBranch(branchName);

  /**
   * Here, we silence errors and ignore them. This
   * isn't great but our main concern is that we're able to create
   * and check out the new branch and these types of error point to
   * larger failure outside of our control.
   */
  if (opts.commitMessage) {
    gpExecSync(
      {
        command: `git commit -m "${opts.commitMessage}" ${
          execStateConfig.noVerify() ? "--no-verify" : ""
        }`,
        options: {
          stdio: "inherit",
        },
      },
      (err) => {
        // Commit failed, usually due to precommit hooks. Rollback the branch.
        checkoutBranch(parentBranch.name);
        gpExecSync({
          command: `git branch -d ${branchName}`,
          options: { stdio: "ignore" },
        });
        throw new ExitFailedError("Failed to commit changes, aborting", err);
      }
    );
  } else {
    logTip(
      [
        `You've created a stacked branch without committing changes to it.`,
        `Without a commit, the new branch and its parent will point to the same commit.`,
        `This temporarily breaks Graphite's ability to infer parent-child branch order.`,
        `We recommend making your staged changes first,`,
        `and then simultaneously creating a new branch and committing to it by running either`,
        `> gt branch create <name> -m <message>`,
        `> gt bc -m <message> # Shortcut alias which autogenerates branch name`,
      ].join("\n")
    );
  }

  new Branch(branchName).setParentBranchName(parentBranch.name);
}

function newBranchName(branchName?: string, commitMessage?: string): string {
  if (!branchName && !commitMessage) {
    throw new ExitFailedError(
      `Must specify at least a branch name or commit message`
    );
  } else if (branchName) {
    return branchName;
  }

  const date = new Date();

  const MAX_BRANCH_NAME_LENGTH = 40;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  let branchMessage = commitMessage!
    .split("")
    .map((c) => {
      if (ALLOWED_BRANCH_CHARACTERS.includes(c)) {
        return c;
      }
      return "_"; // Replace all disallowed characters with _
    })
    .join("")
    .replace(/_+/g, "_");

  if (branchMessage.length <= MAX_BRANCH_NAME_LENGTH - 6) {
    // prepend date if there's room.
    branchMessage =
      `${("0" + (date.getMonth() + 1)).slice(-2)}-${(
        "0" + date.getDate()
      ).slice(-2)}-` + branchMessage; // Condence underscores
  }

  const newBranchName = `${userConfig.getBranchPrefix() || ""}${branchMessage}`;
  return newBranchName.slice(0, MAX_BRANCH_NAME_LENGTH);
}

function checkoutNewBranch(branchName: string): void {
  gpExecSync(
    {
      command: `git checkout -b "${branchName}"`,
    },
    (err) => {
      throw new ExitFailedError(
        `Failed to checkout new branch ${branchName}`,
        err
      );
    }
  );
}

const ALLOWED_BRANCH_CHARACTERS = [
  "_",
  "-",
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
];
