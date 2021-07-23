import { execSync } from "child_process";
import fs from "fs-extra";
import { rebaseInProgress } from "../../src/lib/utils";

const TEXT_FILE_NAME = "test.txt";
export default class GitRepo {
  dir: string;
  constructor(dir: string) {
    this.dir = dir;
    execSync(`git init ${dir} -b main`);
  }

  createChange(textValue: string, prefix?: string): void {
    fs.writeFileSync(
      `${this.dir}/${prefix ? prefix + "_" : ""}${TEXT_FILE_NAME}`,
      textValue
    );
  }

  createChangeAndCommit(textValue: string, prefix?: string): void {
    this.createChange(textValue, prefix);
    execSync(`git -C ${this.dir} add .`);
    execSync(`git -C ${this.dir} commit -m "${textValue}"`);
  }

  createAndCheckoutBranch(name: string): void {
    execSync(`git -C ${this.dir} checkout -b "${name}"`, { stdio: "ignore" });
  }

  checkoutBranch(name: string): void {
    execSync(`git -C ${this.dir} checkout "${name}"`, { stdio: "ignore" });
  }

  rebaseInProgress(): boolean {
    return rebaseInProgress({ dir: this.dir });
  }

  finishInteractiveRebase(): void {
    while (this.rebaseInProgress()) {
      execSync(`git -C ${this.dir} add .`, { stdio: "ignore" });
      execSync(`GIT_EDITOR="touch $1" git -C ${this.dir} rebase --continue`, {
        stdio: "ignore",
      });
    }
  }

  currentBranchName(): string {
    return execSync(`git -C ${this.dir} branch --show-current`)
      .toString()
      .trim();
  }

  listCurrentBranchCommitMessages(): string[] {
    return execSync(`git -C ${this.dir} log --oneline  --format=%B`)
      .toString()
      .trim()
      .split("\n")
      .filter((line) => line.length > 0);
  }
}
