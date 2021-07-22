import { expect } from "chai";
import { execSync } from "child_process";
import fs from "fs-extra";
import tmp from "tmp";
import GitRepo from "../utils/git_repo";
import { execCliCommand } from "../utils/misc";

function fakeGitSquashAndMerge(
  repo: GitRepo,
  branchName: string,
  squashedCommitMessage: string
) {
  // Fake github squash and merge
  execSync(`git -C ${repo.dir} switch -q -c temp ${branchName}`);
  repo.checkoutBranch("temp");
  execSync(`git -C ${repo.dir} rebase main -Xtheirs`);
  execSync(
    `git -C ${repo.dir} reset --soft $(git -C ${repo.dir} merge-base HEAD main)`
  );
  repo.checkoutBranch("main");
  execSync(`git -C ${repo.dir} commit -m "${squashedCommitMessage}"`);
  execSync(`git -C ${repo.dir} branch -D temp`);
}

function expectCommits(repo: GitRepo, commitMessages: string) {
  expect(repo.listCurrentBranchCommitMessages().join(", ")).to.equal(
    commitMessages
  );
}

function expectBranches(repo: GitRepo, sortedBranches: string) {
  expect(
    execSync(
      `git -C ${repo.dir} for-each-ref refs/heads/ "--format=%(refname:short)"`
    )
      .toString()
      .trim()
      .split("\n")
      .sort()
      .join(", ")
  ).to.equal(sortedBranches);
}

// eslint-disable-next-line max-lines-per-function
describe("Sync tests", function () {
  let tmpDir: tmp.DirResult;
  let repo: GitRepo;
  const oldDir = __dirname;
  this.beforeEach(() => {
    tmpDir = tmp.dirSync();
    repo = new GitRepo(tmpDir.name);
    process.chdir(tmpDir.name);
    repo.createChangeAndCommit("1");
  });
  afterEach(() => {
    process.chdir(oldDir);
    console.log(`Dir: ${repo.dir}`);
    fs.emptyDirSync(tmpDir.name);
    tmpDir.removeCallback();
  });
  this.timeout(10000);

  it("Can delete a single merged branch", async () => {
    repo.createChange("2");
    execCliCommand(`diff -b "a" -s`, { fromDir: tmpDir.name });

    expectBranches(repo, "a, main");

    fakeGitSquashAndMerge(repo, "a", "squash");
    execCliCommand(`sync -s --trunk main`, { fromDir: tmpDir.name });

    expectBranches(repo, "main");
  });

  it("Can delete the foundation of a double stack", async () => {
    repo.createChange("2");
    execCliCommand(`diff -b "a" -m "a" -s`, { fromDir: tmpDir.name });

    repo.createChange("3");
    execCliCommand(`diff -b "b" -m "b" -s`, { fromDir: tmpDir.name });

    expectBranches(repo, "a, b, main");

    fakeGitSquashAndMerge(repo, "a", "squash");
    execCliCommand(`sync -s --trunk main`, { fromDir: tmpDir.name });

    expectBranches(repo, "b, main");
    expectCommits(repo, "squash, 1");

    repo.checkoutBranch("b");
    expectCommits(repo, "b, squash, 1");
  });

  it("Can delete two branches off a three-stack", async () => {
    repo.createChange("2");
    execCliCommand(`diff -b "a" -m "a" -s`, { fromDir: tmpDir.name });

    repo.createChange("3");
    execCliCommand(`diff -b "b" -m "b" -s`, { fromDir: tmpDir.name });

    repo.createChange("4");
    execCliCommand(`diff -b "c" -m "c" -s`, { fromDir: tmpDir.name });

    expectBranches(repo, "a, b, c, main");

    fakeGitSquashAndMerge(repo, "a", "squash_a");
    fakeGitSquashAndMerge(repo, "b", "squash_b");
    execCliCommand(`sync -s --trunk main`, { fromDir: tmpDir.name });

    expectBranches(repo, "c, main");
    expectCommits(repo, "squash_b, squash_a, 1");
  });

  it("Can delete two branches, while syncing inbetween, off a three-stack", async () => {
    repo.createChange("2");
    execCliCommand(`diff -b "a" -m "a" -s`, { fromDir: tmpDir.name });

    repo.createChange("3");
    execCliCommand(`diff -b "b" -m "b" -s`, { fromDir: tmpDir.name });

    repo.createChange("4");
    execCliCommand(`diff -b "c" -m "c" -s`, { fromDir: tmpDir.name });

    expectBranches(repo, "a, b, c, main");

    fakeGitSquashAndMerge(repo, "a", "squash_a");
    execCliCommand(`sync -s --trunk main`, { fromDir: tmpDir.name });
    fakeGitSquashAndMerge(repo, "b", "squash_b");
    execCliCommand(`sync -s --trunk main`, { fromDir: tmpDir.name });

    expectBranches(repo, "c, main");
    expectCommits(repo, "squash_b, squash_a, 1");
  });

  xit("Can detect dead branches off multiple stacks", async () => {
    repo.createChange("2");
    execCliCommand(`diff -b "a" -m "a" -s`, { fromDir: tmpDir.name });

    repo.createChange("3");
    execCliCommand(`diff -b "b" -m "b" -s`, { fromDir: tmpDir.name });

    repo.createChange("4");
    execCliCommand(`diff -b "c" -m "c" -s`, { fromDir: tmpDir.name });

    expectBranches(repo, "a, b, c, main");

    repo.checkoutBranch("main");

    repo.createChange("5");
    execCliCommand(`diff -b "d" -m "d" -s`, { fromDir: tmpDir.name });

    repo.createChange("6");
    execCliCommand(`diff -b "e" -m "e" -s`, { fromDir: tmpDir.name });

    fakeGitSquashAndMerge(repo, "a", "squash_a");
    fakeGitSquashAndMerge(repo, "b", "squash_b");
    fakeGitSquashAndMerge(repo, "d", "squash_d");

    execCliCommand(`sync -s --trunk main`, { fromDir: tmpDir.name });

    expectBranches(repo, "c, e, main");
    repo.checkoutBranch("main");
    expectCommits(repo, "squash_b, squash_a, 1");
    repo.checkoutBranch("c");
    expectCommits(repo, "c, squash_d, squash_b, squash_a, 1");
    repo.checkoutBranch("e");
    expectCommits(repo, "e, squash_d, squash_b, squash_a, 1");
  });
});
