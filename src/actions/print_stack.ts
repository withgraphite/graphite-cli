import chalk from "chalk";
import { getTrunk } from "../lib/utils/trunk";
import Branch from "../wrapper-classes/branch";
import Commit from "../wrapper-classes/commit";

type TPrintStackConfig = {
  currentBranch: Branch | null;
  offTrunk: boolean;
};

export function printStack(
  branch: Branch,
  indentLevel: number,
  config: TPrintStackConfig
): void {
  const children = branch.getChildrenFromGit();
  const currPrefix = getPrefix(indentLevel, config);

  children.forEach((child, i) => {
    printStack(child, indentLevel + i, config);
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
  const branchInfo = getBranchInfo(branch, config);
  branchInfo.forEach((line) => console.log(currPrefix + line));

  // print trailing stem
  // note: stem directly behind trunk should be dotted
  console.log(
    currPrefix +
      (!config.offTrunk && branch.name === getTrunk().name ? "․" : "│")
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

  const lastUpdated = getLastUpdated(branch);
  branchInfo.push(`│ ${chalk.gray(lastUpdated)}`);

  return branchInfo;
}

function getLastUpdated(branch: Branch): string {
  const branchTipTimestamp = new Commit(branch.getBranchTipSHA()).timestamp();
  return getReadableTimeBeforeNow(branchTipTimestamp);
}

const MILLISECONDS_IN_SECONDS = 1000;
const SECONDS_IN_MINUTE = 60;
const SECONDS_IN_HOUR = 60 * SECONDS_IN_MINUTE;
const SECONDS_IN_DAY = 24 * SECONDS_IN_HOUR;
const SECONDS_IN_WEEK = 7 * SECONDS_IN_DAY;
const SECONDS_IN_MONTH = 30 * SECONDS_IN_WEEK;
const SECONDS_IN_YEAR = 12 * SECONDS_IN_MONTH;

function getReadableTimeBeforeNow(pastTime: number) {
  const now = Date.now() / MILLISECONDS_IN_SECONDS;
  const diff = now - pastTime;
  if (diff < SECONDS_IN_MINUTE) {
    return "< 1 min old";
  } else if (diff < SECONDS_IN_HOUR) {
    const mins = Math.round(diff / SECONDS_IN_MINUTE);
    return `${mins} min${mins === 1 ? "" : "s"} old`;
  } else if (diff < SECONDS_IN_DAY) {
    const hours = Math.round(diff / SECONDS_IN_HOUR);
    return `${hours} hr${hours === 1 ? "" : "s"} old`;
  } else if (diff < SECONDS_IN_WEEK) {
    const days = Math.round(diff / SECONDS_IN_DAY);
    return `${days} day${days === 1 ? "" : "s"} old`;
  } else if (diff < SECONDS_IN_MONTH) {
    const weeks = Math.round(diff / SECONDS_IN_WEEK);
    return `${weeks} wk${weeks === 1 ? "" : "s"} old`;
  } else if (diff < SECONDS_IN_YEAR) {
    const months = Math.round(diff / SECONDS_IN_MONTH);
    return `${months} mo${months === 1 ? "" : "s"} old`;
  } else {
    const years = Math.round(diff / SECONDS_IN_YEAR);
    return `${years} yr${years === 1 ? "" : "s"} old`;
  }
}
