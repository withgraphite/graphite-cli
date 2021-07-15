import chalk from "chalk";
import { execSync } from "child_process";
import yargs from "yargs";
import Branch from "../../wrapper-classes/branch";
import AbstractCommand from "../abstract_command";

const args = {} as const;
type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export default class PrintStacksCommand extends AbstractCommand<typeof args> {
  static args = args;
  public async _execute(argv: argsT) {
    const gitDag: { [name: string]: string[] } = {};
    (await Branch.getAllBranches()).forEach((branch) => {
      const children = branch.getChildrenFromGit();
      gitDag[branch.name] = children ? children.map((c) => c.name) : [];
    });

    const metaDag: { [name: string]: string[] } = {};
    for (const branch of await Branch.getAllBranches()) {
      const children = await branch.getChildrenFromMeta();
      metaDag[branch.name] = children.map((c) => c.name);
    }

    const currentBranch = await Branch.getCurrentBranch();
    if (currentBranch) {
      console.log(`Current branch: ${chalk.green(`(${currentBranch.name})`)}`);
    }

    const dagsAreEqual =
      Object.keys(gitDag).length == Object.keys(metaDag).length &&
      Object.keys(gitDag).every(
        (key) => metaDag[key].sort().join() == gitDag[key].sort().join()
      );
    if (dagsAreEqual) {
      dfsPrintBranches({
        currentBranchName: currentBranch.name,
        branchName: currentBranch.getTrunkBranchFromGit().name,
        dag: gitDag,
        depthIndents: [],
      });
    } else {
      console.log(
        [
          chalk.yellow(`Git derived stack differs from meta derived stack.`),
          `Run "${chalk.green(
            "restack"
          )}" to update the git stack to match the meta stack.`,
          `Alternatively, run "${chalk.green(
            "regen"
          )}" to update the meta-stack to match the git-stack.\n`,
        ].join("\n")
      );
      console.log(`Git derived stack:`);
      dfsPrintBranches({
        currentBranchName: currentBranch.name,
        branchName: currentBranch.getTrunkBranchFromGit().name,
        dag: gitDag,
        depthIndents: [],
      });
      console.log(`Meta derived stack:`);
      dfsPrintBranches({
        currentBranchName: currentBranch.name,
        branchName: currentBranch.getTrunkBranchFromGit().name,
        dag: metaDag,
        depthIndents: [],
      });
    }
  }
}

function dfsPrintBranches(args: {
  currentBranchName: string;
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
