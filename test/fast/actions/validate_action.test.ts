import { expect } from "chai";
import { validate } from "../../../src/actions/validate";
import { cache } from "../../../src/lib/git-refs";
import { allScenes } from "../../lib/scenes";
import { configureTest } from "../../lib/utils";

for (const scene of allScenes) {
  describe(`(${scene}): validate action`, function () {
    configureTest(this, scene);

    it("Can validate upstack", async () => {
      scene.repo.createChange("a");
      scene.repo.execCliCommand(`branch create "a" -m "a" -q`);

      scene.repo.createAndCheckoutBranch("b");
      scene.repo.createChangeAndCommit("1");

      scene.repo.createChange("c");
      scene.repo.execCliCommand(`branch create "c" -m "c" -q`);

      scene.repo.createChange("d");
      scene.repo.execCliCommand(`branch create "d" -m "d" -q`);

      scene.repo.checkoutBranch("a");
      expect(() => validate("UPSTACK")).to.throw(Error);

      scene.repo.checkoutBranch("b");
      expect(() => validate("UPSTACK")).to.not.throw(Error);

      scene.repo.checkoutBranch("c");
      expect(() => validate("UPSTACK")).to.not.throw(Error);

      scene.repo.checkoutBranch("d");
      expect(() => validate("UPSTACK")).to.not.throw(Error);
    });

    it("Can validate downstack", async () => {
      scene.repo.createChange("a");
      scene.repo.execCliCommand(`branch create "a" -m "a" -q`);

      scene.repo.createAndCheckoutBranch("b");
      scene.repo.createChangeAndCommit("1");

      scene.repo.createChange("c");
      scene.repo.execCliCommand(`branch create "c" -m "c" -q`);

      scene.repo.createChange("d");
      scene.repo.execCliCommand(`branch create "d" -m "d" -q`);

      scene.repo.checkoutBranch("a");
      expect(() => validate("DOWNSTACK")).to.not.throw(Error);

      scene.repo.checkoutBranch("b");
      expect(() => validate("DOWNSTACK")).to.throw(Error);

      scene.repo.checkoutBranch("c");
      expect(() => validate("DOWNSTACK")).to.throw(Error);

      scene.repo.checkoutBranch("d");
      expect(() => validate("DOWNSTACK")).to.throw(Error);
    });

    it("Can validate fullstack", async () => {
      scene.repo.createChange("a");
      scene.repo.execCliCommand(`branch create "a" -m "a" -q`);
      cache.clearAll();
      expect(() => validate("FULLSTACK")).to.not.throw(Error);

      scene.repo.createChange("b");
      scene.repo.execCliCommand(`branch create "b" -m "b" -q`);
      cache.clearAll();
      expect(() => validate("FULLSTACK")).to.not.throw(Error);

      scene.repo.createAndCheckoutBranch("c");
      scene.repo.createChangeAndCommit("c");
      cache.clearAll();
      expect(() => validate("FULLSTACK")).to.throw(Error);
    });
  });
}
