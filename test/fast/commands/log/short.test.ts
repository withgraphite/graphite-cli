import { expect } from "chai";
import { execSync } from "child_process";
import { TrailingProdScene } from "../../../lib/scenes";
import { configureTest } from "../../../lib/utils";
import fs from "fs-extra";

for (const scene of [new TrailingProdScene()]) {
  describe(`(${scene}): log short`, function () {
    configureTest(this, scene);

    it('Can log short', () => {
      expect(() => scene.repo.execCliCommand(`log short`)).to.not.throw(Error);
    });

    it("Can print stacks if a branch's parent has been deleted", () => {
      // This is mostly an effort to recreate a messed-up repo state that created a bug for a user.
      scene.repo.createChange('a', 'a');
      scene.repo.execCliCommand(`branch create a -m "a"`);

      scene.repo.createChange('b', 'b');
      scene.repo.execCliCommand(`branch create b -m "b"`);

      scene.repo.checkoutBranch('main');
      scene.repo.createChangeAndCommit('2', '2');
      scene.repo.checkoutBranch('a');
      execSync(`git -C ${scene.repo.dir} rebase prod`);

      // b's now has no git-parents, but it's meta points to "a" which still exists but is not off main.
      expect(() => scene.repo.execCliCommand(`log short`)).to.not.throw(Error);
    });

    it('Errors if trunk has two branches pointing to one commit', () => {
      scene.repo.execCliCommand(`branch create a`);
      scene.repo.checkoutBranch('main');
      expect(() => scene.repo.execCliCommand('log short')).to.throw(Error);
    });

    it("Works if branch and file have same name", () => {
      const textFileName = "test.txt"
      scene.repo.execCliCommand(`branch create ${textFileName}`);

      // Creates a commit with contents "a" in file "test.txt"
      scene.repo.createChangeAndCommit("a");
      expect(fs.existsSync(textFileName)).to.be.true;

      scene.repo.checkoutBranch(textFileName)

      // gt log should work - using "test.txt" as a revision rather than a path
      expect(() => scene.repo.execCliCommand("log")).to.not.throw(Error);
      expect(() => scene.repo.execCliCommand("log short")).to.not.throw(Error);
    });
  });
}
