"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const child_process_1 = require("child_process");
const branch_1 = __importDefault(require("../../wrapper-classes/branch"));
const abstract_command_1 = __importDefault(require("../abstract_command"));
const args = {};
function computeDag(truth) {
    const dag = {};
    const sourceBranches = [];
    branch_1.default.allBranches().forEach((branch) => {
        const parents = truth == "GIT"
            ? branch.getParentsFromGit() || []
            : [branch.getParentFromMeta()].filter((b) => b != undefined);
        if (parents.length > 0) {
            parents.forEach((parent) => {
                if (dag[parent.name]) {
                    dag[parent.name].push(branch.name);
                }
                else {
                    dag[parent.name] = [branch.name];
                }
            });
        }
        else {
            sourceBranches.push(branch.name);
        }
    });
    return { dag, sourceBranches };
}
class PrintStacksCommand extends abstract_command_1.default {
    _execute(argv) {
        return __awaiter(this, void 0, void 0, function* () {
            const gitInfo = computeDag("GIT");
            const metaInfo = computeDag("META");
            const currentBranch = branch_1.default.getCurrentBranch();
            if (currentBranch) {
                console.log(`Current branch: ${chalk_1.default.green(`(${currentBranch.name})`)}`);
            }
            const dagsAreEqual = Object.keys(gitInfo.dag).length == Object.keys(metaInfo.dag).length &&
                Object.keys(gitInfo.dag).every((key) => metaInfo.dag[key].sort().join() == gitInfo.dag[key].sort().join());
            if (dagsAreEqual) {
                gitInfo.sourceBranches.forEach((sourceBranch) => {
                    dfsPrintBranches({
                        currentBranchName: currentBranch.name,
                        branchName: sourceBranch,
                        dag: gitInfo.dag,
                        depthIndents: [],
                    });
                });
            }
            else {
                console.log([
                    chalk_1.default.yellow(`Git derived stack differs from meta derived stack.`),
                    `Run "${chalk_1.default.green("restack")}" to update the git stack to match the meta stack.`,
                    `Alternatively, run "${chalk_1.default.green("regen")}" to update the meta-stack to match the git-stack.\n`,
                ].join("\n"));
                console.log(`Git derived stacks:`);
                gitInfo.sourceBranches.forEach((sourceBranch) => {
                    dfsPrintBranches({
                        currentBranchName: currentBranch.name,
                        branchName: sourceBranch,
                        dag: gitInfo.dag,
                        depthIndents: [],
                    });
                });
                console.log("");
                console.log(`Meta derived stacks:`);
                metaInfo.sourceBranches.forEach((sourceBranch) => {
                    dfsPrintBranches({
                        currentBranchName: currentBranch.name,
                        branchName: sourceBranch,
                        dag: metaInfo.dag,
                        depthIndents: [],
                    });
                });
            }
        });
    }
}
exports.default = PrintStacksCommand;
PrintStacksCommand.args = args;
function dfsPrintBranches(args) {
    const numCommitsSinceParent = args.parentName
        ? +child_process_1.execSync(`git log --oneline ${args.branchName} ^${args.parentName} | wc -l`)
            .toString()
            .trim()
        : 0;
    const numCommitsSinceChild = args.parentName
        ? +child_process_1.execSync(`git log --oneline ${args.parentName} ^${args.branchName} | wc -l`)
            .toString()
            .trim()
        : 0;
    console.log(`${args.depthIndents
        .map((length, i) => `${" ".repeat(length)}|`)
        .join("")}${numCommitsSinceChild > 0
        ? `[${chalk_1.default.red("*".repeat(numCommitsSinceChild))}]`
        : ""}->(${args.currentBranchName == args.branchName
        ? chalk_1.default.green(args.branchName)
        : args.branchName})${numCommitsSinceParent > 0 ? `[${"*".repeat(numCommitsSinceParent)}]` : ""}`);
    if (!args.dag[args.branchName]) {
        return;
    }
    args.dag[args.branchName].forEach((childName) => dfsPrintBranches({
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
    }));
    console.log(`${args.depthIndents.map((length, i) => `${" ".repeat(length)}|`).join("")}`);
}
//# sourceMappingURL=index.js.map