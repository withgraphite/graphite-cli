import chalk from "chalk";
import { execSync } from "child_process";
import AbstractCommand from "../../../lib/abstract_command";
import Branch from "../../../wrapper-classes/branch";

const args = {} as const;

function computeDag(truth: "GIT" | "META"): {
  dag: { [name: string]: string[] };
  sourceBranches: string[];
} {
  const dag: { [name: string]: string[] } = {};
  const sourceBranches: string[] = [];
  Branch.allBranches().forEach((branch) => {
    const parents =
      truth == "GIT"
        ? branch.getParentsFromGit() || []
        : ([branch.getParentFromMeta()].filter(
            (b) => b != undefined
          ) as Branch[]);
    if (parents.length > 0) {
      parents.forEach((parent) => {
        if (dag[parent.name]) {
          dag[parent.name].push(branch.name);
        } else {
          dag[parent.name] = [branch.name];
        }
      });
    } else {
      sourceBranches.push(branch.name);
    }
  });
  return { dag, sourceBranches };
}
export default class PrintStacksCommand extends AbstractCommand<typeof args> {
  static args = args;
  public async _execute(): Promise<void> {
    const gitInfo = computeDag("GIT");
    const metaInfo = computeDag("META");

    const currentBranch = Branch.getCurrentBranch();
    if (currentBranch) {
      console.log(`Current branch: ${chalk.green(`(${currentBranch.name})`)}`);
    }
    const currentBranchName =
      currentBranch !== null ? currentBranch.name : null;

    const dagsAreEqual =
      Object.keys(gitInfo.dag).length == Object.keys(metaInfo.dag).length &&
      Object.keys(gitInfo.dag).every(
        (key) =>
          metaInfo.dag[key] != undefined &&
          metaInfo.dag[key].sort().join() == gitInfo.dag[key].sort().join()
      );
    if (dagsAreEqual) {
      gitInfo.sourceBranches.forEach((sourceBranch) => {
        dfsPrintBranches({
          currentBranchName: currentBranchName,
          branchName: sourceBranch,
          dag: gitInfo.dag,
          depthIndents: [],
        });
      });
    } else {
      console.log(
        [
          chalk.yellow(`Git derived stack differs from meta derived stack.`),
          `Run "${chalk.green(
            "gp stack fix"
          )}" to update the git stack to match the meta stack.`,
          `Alternatively, run "${chalk.green(
            "gp stack regen"
          )}" to update the meta-stack to match the git-stack.\n`,
        ].join("\n")
      );
      console.log(`Git derived stacks:`);
      gitInfo.sourceBranches.forEach((sourceBranch) => {
        dfsPrintBranches({
          currentBranchName: currentBranchName,
          branchName: sourceBranch,
          dag: gitInfo.dag,
          depthIndents: [],
        });
      });
      console.log("");
      console.log(`Meta derived stacks:`);
      metaInfo.sourceBranches.forEach((sourceBranch) => {
        dfsPrintBranches({
          currentBranchName: currentBranchName,
          branchName: sourceBranch,
          dag: metaInfo.dag,
          depthIndents: [],
        });
      });
    }
  }
}

function dfsPrintBranches(args: {
  currentBranchName: string | null;
  branchName: string;
  parentName?: string;
  dag: { [name: string]: string[] };
  depthIndents: number[];
}) {
  const numCommitsSinceParent: number = args.parentName
    ? +execSync(
        `git log --oneline ${args.branchName} ^${args.parentName} | wc -l`
      )
        .toString()
        .trim()
    : 0;
  const numCommitsSinceChild: number = args.parentName
    ? +execSync(
        `git log --oneline ${args.parentName} ^${args.branchName} | wc -l`
      )
        .toString()
        .trim()
    : 0;
  console.log(
    `${args.depthIndents
      .map((length, i) => `${" ".repeat(length)}|`)
      .join("")}${
      numCommitsSinceChild > 0
        ? `[${chalk.red("*".repeat(numCommitsSinceChild))}]`
        : ""
    }->(${
      args.currentBranchName == args.branchName
        ? chalk.green(args.branchName)
        : args.branchName
    })${
      numCommitsSinceParent > 0 ? `[${"*".repeat(numCommitsSinceParent)}]` : ""
    }`
  );
  if (!args.dag[args.branchName]) {
    return;
  }
  args.dag[args.branchName].forEach((childName) =>
    dfsPrintBranches({
      parentName: args.branchName,
      currentBranchName: args.currentBranchName,
      branchName: childName,
      dag: args.dag,
      depthIndents: [
        ...args.depthIndents,
        numCommitsSinceParent +
          args.branchName.length -
          1 +
          (numCommitsSinceParent > 0 ? 2 : 0) +
          4,
      ],
    })
  );
  console.log(
    `${args.depthIndents.map((length, i) => `${" ".repeat(length)}|`).join("")}`
  );
}
