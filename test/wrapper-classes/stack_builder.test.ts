import { expect } from "chai";
import {
  GitStackBuilder,
  MetaStackBuilder,
  Stack,
} from "../../src/wrapper-classes";
import { allScenes } from "../scenes";
import { configureTest } from "../utils";

for (const scene of allScenes) {
  describe(`(${scene}): stack builder class`, function () {
    configureTest(this, scene);

    it("Can print stacks from git", () => {
      scene.repo.createAndCheckoutBranch("a");
      scene.repo.createChangeAndCommit("a");

      scene.repo.createAndCheckoutBranch("b");
      scene.repo.createChangeAndCommit("b");

      scene.repo.createAndCheckoutBranch("c");
      scene.repo.createChangeAndCommit("c");

      scene.repo.checkoutBranch("main");
      scene.repo.createAndCheckoutBranch("d");
      scene.repo.createChangeAndCommit("d");

      const gitStacks = new GitStackBuilder().allStacksFromTrunk();
      const metaStacks = new MetaStackBuilder().allStacksFromTrunk();
      expect(
        gitStacks[0].equals(Stack.fromMap({ main: { a: { b: { c: {} } } } }))
      ).to.be.true;
      expect(gitStacks[1].equals(Stack.fromMap({ main: { d: {} } }))).to.be
        .true;

      // Expect default meta to be 4 stacks of 1 off main.
      expect(metaStacks.length).to.eq(4);
      expect(metaStacks[0].equals(Stack.fromMap({ main: { a: {} } })));
      expect(metaStacks[1].equals(Stack.fromMap({ main: { b: {} } })));
      expect(metaStacks[2].equals(Stack.fromMap({ main: { c: {} } })));
      expect(metaStacks[3].equals(Stack.fromMap({ main: { d: {} } })));
    });

    it("Can print stacks from meta", () => {
      scene.repo.createChange("a");
      scene.repo.execCliCommand(`branch create "a" -m "a" -s`);

      scene.repo.createChange("b");
      scene.repo.execCliCommand(`branch create "b" -m "b" -s`);

      scene.repo.createChange("c");
      scene.repo.execCliCommand(`branch create "c" -m "c" -s`);

      scene.repo.checkoutBranch("main");

      scene.repo.createChange("d");
      scene.repo.execCliCommand(`branch create "d" -m "d" -s`);

      const metaStacks = new MetaStackBuilder().allStacksFromTrunk();
      const gitStacks = new GitStackBuilder().allStacksFromTrunk();

      expect(
        metaStacks[0].equals(Stack.fromMap({ main: { a: { b: { c: {} } } } }))
      ).to.be.true;
      expect(metaStacks[1].equals(Stack.fromMap({ main: { d: {} } }))).to.be
        .true;

      // Expect git and meta stacks to equal
      expect(gitStacks[0].equals(metaStacks[0])).to.be.true;
      expect(gitStacks[1].equals(metaStacks[1])).to.be.true;
    });
  });
}
