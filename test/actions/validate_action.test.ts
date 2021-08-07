import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import { validate } from "../../src/actions/validate";
import { allScenes } from "../scenes";
import { configureTest } from "../utils";

chai.use(chaiAsPromised);

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
      await expect(validate("UPSTACK")).to.eventually.be.rejectedWith(Error);

      scene.repo.checkoutBranch("b");
      await expect(validate("UPSTACK")).to.not.eventually.be.rejectedWith(
        Error
      );

      scene.repo.checkoutBranch("c");
      await expect(validate("UPSTACK")).to.not.eventually.be.rejectedWith(
        Error
      );

      scene.repo.checkoutBranch("d");
      await expect(validate("UPSTACK")).to.not.eventually.be.rejectedWith(
        Error
      );
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
      await expect(validate("DOWNSTACK")).to.not.eventually.be.rejectedWith(
        Error
      );

      scene.repo.checkoutBranch("b");
      await expect(validate("DOWNSTACK")).to.eventually.be.rejectedWith(Error);

      scene.repo.checkoutBranch("c");
      await expect(validate("DOWNSTACK")).to.eventually.be.rejectedWith(Error);

      scene.repo.checkoutBranch("d");
      await expect(validate("DOWNSTACK")).to.eventually.be.rejectedWith(Error);
    });

    it("Can validate fullstack", async () => {
      scene.repo.createChange("a");
      scene.repo.execCliCommand(`branch create "a" -m "a" -q`);
      await expect(validate("FULLSTACK")).to.not.eventually.be.rejectedWith(
        Error
      );

      scene.repo.createChange("b");
      scene.repo.execCliCommand(`branch create "b" -m "b" -q`);
      await expect(validate("FULLSTACK")).to.not.eventually.be.rejectedWith(
        Error
      );

      scene.repo.createAndCheckoutBranch("c");
      scene.repo.createChangeAndCommit("c");
      await expect(validate("FULLSTACK")).to.eventually.be.rejectedWith(Error);
    });
  });
}
