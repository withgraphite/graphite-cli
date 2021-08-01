import { expect } from "chai";
import { execSync } from "child_process";
import { allScenes } from "../../scenes";
import { configureTest } from "../../utils";
import GitRepo from "../../utils/git_repo";

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

function expectBranches(repo: GitRepo, sortedBranches: string) {
  expect(
    execSync(
      `git -C ${repo.dir} for-each-ref refs/heads/ "--format=%(refname:short)"`
    )
      .toString()
      .trim()
      .split("\n")
      .filter((b) => b !== "prod")
      .sort()
      .join(", ")
  ).to.equal(sortedBranches);
}

for (const scene of allScenes) {
  // eslint-disable-next-line max-lines-per-function
  describe(`(${scene}): stack clean`, function () {
    configureTest(this, scene);

    it("Can delete a single merged branch", async () => {
      scene.repo.createChange("2", "a");
      scene.repo.execCliCommand(`branch create "a" -s`);

      expectBranches(scene.repo, "a, main");

      fakeGitSquashAndMerge(scene.repo, "a", "squash");
      scene.repo.execCliCommand(`stack clean -sf --trunk main`);

      expectBranches(scene.repo, "main");
    });

    it("Can delete the foundation of a double stack", async () => {
      scene.repo.createChange("2", "a");
      scene.repo.execCliCommand(`branch create "a" -m "a" -s`);

      scene.repo.createChange("3", "b");
      scene.repo.execCliCommand(`branch create "b" -m "b" -s`);

      expectBranches(scene.repo, "a, b, main");

      fakeGitSquashAndMerge(scene.repo, "a", "squash");
      scene.repo.execCliCommand(`stack clean -sf --trunk main`);

      expectBranches(scene.repo, "b, main");
      scene.repo.expectCommits("squash, 1");

      scene.repo.checkoutBranch("b");
      scene.repo.expectCommits("b, squash, 1");
    });

    it("Can delete two branches off a three-stack", async () => {
      scene.repo.createChange("2", "a");
      scene.repo.execCliCommand(`branch create "a" -m "a" -s`);

      scene.repo.createChange("3", "b");
      scene.repo.execCliCommand(`branch create "b" -m "b" -s`);

      scene.repo.createChange("4", "c");
      scene.repo.execCliCommand(`branch create "c" -m "c" -s`);

      expectBranches(scene.repo, "a, b, c, main");

      fakeGitSquashAndMerge(scene.repo, "a", "squash_a");
      fakeGitSquashAndMerge(scene.repo, "b", "squash_b");
      scene.repo.execCliCommand(`stack clean -sf --trunk main`);

      expectBranches(scene.repo, "c, main");
      scene.repo.expectCommits("squash_b, squash_a, 1");
    });

    it("Can delete two branches, while syncing inbetween, off a three-stack", async () => {
      scene.repo.createChange("2", "a");
      scene.repo.execCliCommand(`branch create "a" -m "a" -s`);

      scene.repo.createChange("3", "b");
      scene.repo.execCliCommand(`branch create "b" -m "b" -s`);

      scene.repo.createChange("4", "c");
      scene.repo.execCliCommand(`branch create "c" -m "c" -s`);

      expectBranches(scene.repo, "a, b, c, main");

      fakeGitSquashAndMerge(scene.repo, "a", "squash_a");
      scene.repo.execCliCommand(`stack clean -sf --trunk main`);
      fakeGitSquashAndMerge(scene.repo, "b", "squash_b");
      scene.repo.execCliCommand(`stack clean -sf --trunk main`);

      expectBranches(scene.repo, "c, main");
      scene.repo.expectCommits("squash_b, squash_a, 1");
    });

    xit("Can detect dead branches off multiple stacks", async () => {
      scene.repo.createChange("2", "a");
      scene.repo.execCliCommand(`branch create "a" -m "a" -s`);

      scene.repo.createChange("3", "b");
      scene.repo.execCliCommand(`branch create "b" -m "b" -s`);

      scene.repo.createChange("4", "c");
      scene.repo.execCliCommand(`branch create "c" -m "c" -s`);

      expectBranches(scene.repo, "a, b, c, main");

      scene.repo.checkoutBranch("main");

      scene.repo.createChange("5", "d");
      scene.repo.execCliCommand(`branch create "d" -m "d" -s`);

      scene.repo.createChange("6", "e");
      scene.repo.execCliCommand(`branch create "e" -m "e" -s`);

      fakeGitSquashAndMerge(scene.repo, "a", "squash_a");
      fakeGitSquashAndMerge(scene.repo, "b", "squash_b");
      fakeGitSquashAndMerge(scene.repo, "d", "squash_d");

      scene.repo.execCliCommand(`stack clean -sf --trunk main`);

      expectBranches(scene.repo, "c, e, main");
      scene.repo.checkoutBranch("main");
      scene.repo.expectCommits("squash_b, squash_a, 1");
      scene.repo.checkoutBranch("c");
      scene.repo.expectCommits("c, squash_d, squash_b, squash_a, 1");
      scene.repo.checkoutBranch("e");
      scene.repo.expectCommits("e, squash_d, squash_b, squash_a, 1");
    });
  });
}
