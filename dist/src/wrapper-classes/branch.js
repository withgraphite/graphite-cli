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
exports.MAX_COMMITS_TO_TRAVERSE_FOR_NEXT_OR_PREV = void 0;
const child_process_1 = require("child_process");
const commit_1 = __importDefault(require("./commit"));
exports.MAX_COMMITS_TO_TRAVERSE_FOR_NEXT_OR_PREV = 50;
function gitTreeFromRevListOutput(output) {
    const ret = {};
    for (const line of output.split("\n")) {
        if (line.length > 0) {
            const shas = line.split(" ");
            ret[shas[0]] = shas.slice(1);
        }
    }
    return ret;
}
function branchListFromShowRefOutput(output) {
    const ret = {};
    for (const line of output.split("\n")) {
        if (line.length > 0) {
            const parts = line.split(" ");
            ret[parts[0]] = parts[1].slice("refs/heads/".length);
        }
    }
    return ret;
}
function traverseGitTreeFromCommitUntilBranch(commit, gitTree, branchList, n) {
    // Skip the first iteration b/c that is the CURRENT branch
    if (n > 0 && commit in branchList) {
        return new Set([branchList[commit]]);
    }
    // Limit the seach
    if (n > exports.MAX_COMMITS_TO_TRAVERSE_FOR_NEXT_OR_PREV) {
        return new Set();
    }
    if (!gitTree[commit] || gitTree[commit].length == 0) {
        return new Set();
    }
    const commitsMatchingBranches = new Set();
    for (const neighborCommit of gitTree[commit]) {
        const discoveredMatches = traverseGitTreeFromCommitUntilBranch(neighborCommit, gitTree, branchList, n + 1);
        if (discoveredMatches.size === 0) {
            return discoveredMatches;
        }
        else {
            discoveredMatches.forEach((commit) => {
                commitsMatchingBranches.add(commit);
            });
        }
    }
    return commitsMatchingBranches;
}
class Branch {
    constructor(name) {
        this.name = name;
    }
    toString() {
        return this.name;
    }
    getMeta() {
        try {
            const metaString = child_process_1.execSync(`git cat-file -p refs/branch-metadata/${this.name} 2> /dev/null`)
                .toString()
                .trim();
            if (metaString.length == 0) {
                return undefined;
            }
            // TODO: Better account for malformed desc; possibly validate with retype
            const meta = JSON.parse(metaString);
            return meta;
        }
        catch (_a) {
            return undefined;
        }
    }
    writeMeta(desc) {
        const metaSha = child_process_1.execSync(`git hash-object -w --stdin`, {
            input: JSON.stringify(desc),
        }).toString();
        child_process_1.execSync(`git update-ref refs/branch-metadata/${this.name} ${metaSha}`, {
            stdio: "ignore",
        });
    }
    stackByTracingMetaParents(branch) {
        const curBranch = branch || this;
        const metaParent = curBranch.getParentFromMeta();
        if (metaParent) {
            return this.stackByTracingMetaParents(metaParent).concat([
                curBranch.name,
            ]);
        }
        else {
            return [curBranch.name];
        }
    }
    stackByTracingGitParents(branch) {
        const curBranch = branch || this;
        const gitParents = curBranch.getParentsFromGit();
        if (gitParents.length === 1) {
            return this.stackByTracingMetaParents(gitParents[0]).concat([
                curBranch.name,
            ]);
        }
        else {
            return [curBranch.name];
        }
    }
    getParentFromMeta() {
        var _a;
        const parentName = (_a = this.getMeta()) === null || _a === void 0 ? void 0 : _a.parentBranchName;
        if (parentName) {
            return new Branch(parentName);
        }
        return undefined;
    }
    static allBranches() {
        return child_process_1.execSync(`git for-each-ref --format='%(refname:short)' refs/heads/`)
            .toString()
            .trim()
            .split("\n")
            .map((name) => new Branch(name));
    }
    getChildrenFromMeta() {
        return __awaiter(this, void 0, void 0, function* () {
            const children = Branch.allBranches().filter((b) => { var _a; return ((_a = b.getMeta()) === null || _a === void 0 ? void 0 : _a.parentBranchName) === this.name; });
            return children;
        });
    }
    setParentBranchName(parentBranchName) {
        this.writeMeta({ parentBranchName });
    }
    getTrunkBranchFromGit() {
        const gitParents = this.getParentsFromGit();
        if (gitParents.length == 1) {
            return gitParents[0].getTrunkBranchFromGit();
        }
        else if (gitParents.length > 1) {
            console.log(`Cannot derive trunk from git branch (${this.name}) with two parents`);
            process.exit(1);
        }
        else {
            return this;
        }
    }
    static branchWithName(name) {
        return __awaiter(this, void 0, void 0, function* () {
            const branch = Branch.allBranches().find((b) => b.name === name);
            if (!branch) {
                throw new Error(`Failed to find branch named ${name}`);
            }
            return new Branch(name);
        });
    }
    static getCurrentBranch() {
        return new Branch(child_process_1.execSync(`git rev-parse --abbrev-ref HEAD`).toString().trim());
    }
    static getAllBranchesWithoutParents() {
        return __awaiter(this, void 0, void 0, function* () {
            return Branch.allBranches().filter((b) => b.getParentsFromGit().length === 0);
        });
    }
    static getAllBranchesWithParents() {
        return __awaiter(this, void 0, void 0, function* () {
            return Branch.allBranches().filter((b) => b.getParentsFromGit().length > 0);
        });
    }
    head() {
        return new commit_1.default(child_process_1.execSync(`git rev-parse ${this.name}`).toString().trim());
    }
    base() {
        var _a;
        const parentBranchName = (_a = this.getMeta()) === null || _a === void 0 ? void 0 : _a.parentBranchName;
        if (!parentBranchName) {
            return undefined;
        }
        return new commit_1.default(child_process_1.execSync(`git merge-base ${parentBranchName} ${this.name}`)
            .toString()
            .trim());
    }
    getChildrenFromGit() {
        return this.getChildrenOrParents("CHILDREN");
    }
    getParentsFromGit() {
        return this.getChildrenOrParents("PARENTS");
    }
    getChildrenOrParents(opt) {
        const revListOutput = child_process_1.execSync(`git rev-list ${opt === "CHILDREN" ? "--children" : "--parents"} --all`, {
            maxBuffer: 1024 * 1024 * 1024,
        });
        const gitTree = gitTreeFromRevListOutput(revListOutput.toString().trim());
        const showRefOutput = child_process_1.execSync("git show-ref --heads", {
            maxBuffer: 1024 * 1024 * 1024,
        });
        const branchList = branchListFromShowRefOutput(showRefOutput.toString().trim());
        const headSha = child_process_1.execSync(`git rev-parse ${this.name}`).toString().trim();
        return Array.from(traverseGitTreeFromCommitUntilBranch(headSha, gitTree, branchList, 0)).map((name) => new Branch(name));
    }
}
exports.default = Branch;
//# sourceMappingURL=branch.js.map