import { expect } from "chai";
import {
  Branch,
  GitStackBuilder,
  MetaStackBuilder,
  Stack,
} from "../../src/wrapper-classes";
import { allScenes } from "../scenes";
import { configureTest } from "../utils";

for (const scene of allScenes) {
  // eslint-disable-next-line max-lines-per-function
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

      scene.repo.checkoutBranch("main");

      scene.repo.createChange("d");
      scene.repo.execCliCommand(`branch create "d" -m "d" -s`);

      const metaStacks = new MetaStackBuilder().allStacksFromTrunk();
      const gitStacks = new GitStackBuilder().allStacksFromTrunk();

      expect(metaStacks[0].equals(Stack.fromMap({ main: { a: { b: {} } } }))).to
        .be.true;
      expect(metaStacks[1].equals(Stack.fromMap({ main: { d: {} } }))).to.be
        .true;

      // Expect git and meta stacks to equal
      expect(gitStacks[0].equals(metaStacks[0])).to.be.true;
      expect(gitStacks[1].equals(metaStacks[1])).to.be.true;
    });

    it("Can get full stack from a branch", () => {
      scene.repo.createChange("a");
      scene.repo.execCliCommand(`branch create "a" -m "a" -s`);

      scene.repo.createChange("b");
      scene.repo.execCliCommand(`branch create "b" -m "b" -s`);

      scene.repo.checkoutBranch("main");

      scene.repo.createChange("d");
      scene.repo.execCliCommand(`branch create "d" -m "d" -s`);

      const metaStack = new MetaStackBuilder().fullStackFromBranch(
        new Branch("a")
      );
      const gitStack = new GitStackBuilder().fullStackFromBranch(
        new Branch("a")
      );

      expect(metaStack.equals(Stack.fromMap({ main: { a: { b: {} } } }))).to.be
        .true;
      expect(metaStack.equals(gitStack)).to.be.true;
    });

    it("Can get full stack from trunk", () => {
      scene.repo.createChange("a");
      scene.repo.execCliCommand(`branch create "a" -m "a" -s`);

      scene.repo.createChange("b");
      scene.repo.execCliCommand(`branch create "b" -m "b" -s`);

      scene.repo.checkoutBranch("main");

      scene.repo.createChange("d");
      scene.repo.execCliCommand(`branch create "d" -m "d" -s`);

      const metaStack = new MetaStackBuilder().fullStackFromBranch(
        new Branch("main")
      );
      const gitStack = new GitStackBuilder().fullStackFromBranch(
        new Branch("main")
      );

      expect(metaStack.equals(Stack.fromMap({ main: { a: { b: {} }, d: {} } })))
        .to.be.true;
      expect(gitStack.equals(metaStack)).to.be.true;
    });

    it("Can find different git and meta stacks", () => {
      scene.repo.createChange("a");
      scene.repo.execCliCommand(`branch create "a" -m "a" -s`);

      scene.repo.checkoutBranch("main");
      scene.repo.createChangeAndCommit("b");

      const metaStack = new MetaStackBuilder().fullStackFromBranch(
        new Branch("a")
      );
      const gitStack = new GitStackBuilder().fullStackFromBranch(
        new Branch("a")
      );

      expect(metaStack.equals(Stack.fromMap({ main: { a: {} } }))).to.be.true;
      expect(gitStack.equals(Stack.fromMap({ a: {} }))).to.be.true;
    });
  });
}
