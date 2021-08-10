import chalk from "chalk";
import { getCommitterDate } from "../lib/utils";
import { getTrunk } from "../lib/utils/trunk";
import Branch from "../wrapper-classes/branch";

type TPrintStackConfig = {
  currentBranch: Branch | null;
  offTrunk: boolean;
};

export function printStack(args: {
  baseBranch: Branch;
  indentLevel: number;
  config: TPrintStackConfig;
}): void {
  const children = args.baseBranch.getChildrenFromGit();
  const currPrefix = getPrefix(args.indentLevel, args.config);

  children.forEach((child, i) => {
    printStack({
      baseBranch: child,
      indentLevel: args.indentLevel + i,
      config: args.config,
    });
  });

  // 1) if there is only 1 child, we only need to continue the parent's stem
  // 2) if there are multiple children, the 2..n children branch off
  //    horizontally
  const numChildren = children.length;
  if (numChildren > 1) {
    let newBranchOffshoots = "│";
    // we only need to draw numChildren - 1 offshots since the first child
    // continues the parent's main stem
    for (let i = 1; i < numChildren; i++) {
      if (i < numChildren - 1) {
        newBranchOffshoots += "──┴";
      } else {
        newBranchOffshoots += "──┘";
      }
    }
    console.log(currPrefix + newBranchOffshoots);
    console.log(currPrefix + "│");
  }

  // print lines of branch info
  const branchInfo = getBranchInfo(args.baseBranch, args.config);
  branchInfo.forEach((line) => console.log(currPrefix + line));

  // print trailing stem
  // note: stem directly behind trunk should be dotted
  console.log(
    currPrefix +
      (!args.config.offTrunk && args.baseBranch.name === getTrunk().name
        ? "․"
        : "│")
  );
}

function getPrefix(indentLevel: number, config: TPrintStackConfig): string {
  let prefix = "";
  for (let i = 0; i < indentLevel; i++) {
    // if we're behind trunk, the stem of trunk's branch should be dotted
    if (i === 0) {
      prefix += config.offTrunk ? "│  " : "․  ";
    } else {
      prefix += "│  ";
    }
  }
  return prefix;
}

function getBranchInfo(branch: Branch, config: TPrintStackConfig): string[] {
  const branchInfo = [];

  const isCurrentBranch = config.currentBranch?.name === branch.name;
  const prInfo = branch.getPRInfo();

  const dot = isCurrentBranch ? chalk.cyan("◉") : "◯";
  const branchName = isCurrentBranch
    ? chalk.cyan(`${branch.name} (current)`)
    : chalk.blueBright(branch.name);
  const pr = prInfo !== undefined ? chalk.yellow(`PR #${prInfo.number}`) : "";
  branchInfo.push(`${dot} ${branchName} ${pr}`);

  branchInfo.push(
    `│ ${chalk.dim(
      getCommitterDate({
        revision: branch.name,
        timeFormat: "RELATIVE_READABLE",
      })
    )}`
  );

  return branchInfo;
}
