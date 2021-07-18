"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const fs_extra_1 = __importDefault(require("fs-extra"));
const TEXT_FILE_NAME = "test.txt";
class GitRepo {
    constructor(dir) {
        this.dir = dir;
        child_process_1.execSync(`git init ${dir} -b main`);
    }
    createChange(textValue) {
        fs_extra_1.default.writeFileSync(`${this.dir}/${TEXT_FILE_NAME}`, textValue);
    }
    createChangeAndCommit(textValue) {
        this.createChange(textValue);
        child_process_1.execSync(`git -C ${this.dir} add "${this.dir}/test.txt"`);
        child_process_1.execSync(`git -C ${this.dir} commit -m "${textValue}"`);
    }
    createAndCheckoutBranch(name) {
        child_process_1.execSync(`git -C ${this.dir} checkout -b "${name}"`, { stdio: "ignore" });
    }
    checkoutBranch(name) {
        child_process_1.execSync(`git -C ${this.dir} checkout "${name}"`, { stdio: "ignore" });
    }
    currentBranchName() {
        return child_process_1.execSync(`git -C ${this.dir} rev-parse --abbrev-ref HEAD`)
            .toString()
            .trim();
    }
    listCurrentBranchCommitMessages() {
        return child_process_1.execSync(`git -C ${this.dir} log --oneline  --format=%B`)
            .toString()
            .trim()
            .split("\n")
            .filter((line) => line.length > 0);
    }
}
exports.default = GitRepo;
//# sourceMappingURL=git_repo.js.map