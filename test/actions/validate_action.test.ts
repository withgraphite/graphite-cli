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
      scene.repo.execCliCommand(`branch create "a" -s`);

      scene.repo.createAndCheckoutBranch("b");
      scene.repo.createChangeAndCommit("1");

      scene.repo.createChange("c");
      scene.repo.execCliCommand(`branch create "c" -s`);

      scene.repo.createChange("d");
      scene.repo.execCliCommand(`branch create "d" -s`);

      scene.repo.checkoutBranch("a");
      await expect(validate("UPSTACK", true)).to.eventually.be.rejectedWith(
        Error
      );

      scene.repo.checkoutBranch("b");
      await expect(validate("UPSTACK", true)).to.not.eventually.be.rejectedWith(
        Error
      );

      scene.repo.checkoutBranch("c");
      await expect(validate("UPSTACK", true)).to.not.eventually.be.rejectedWith(
        Error
      );

      scene.repo.checkoutBranch("d");
      await expect(validate("UPSTACK", true)).to.not.eventually.be.rejectedWith(
        Error
      );
    });

    it("Can validate downstack", async () => {
      scene.repo.createChange("a");
      scene.repo.execCliCommand(`branch create "a" -s`);

      scene.repo.createAndCheckoutBranch("b");
      scene.repo.createChangeAndCommit("1");

      scene.repo.createChange("c");
      scene.repo.execCliCommand(`branch create "c" -s`);

      scene.repo.createChange("d");
      scene.repo.execCliCommand(`branch create "d" -s`);

      scene.repo.checkoutBranch("a");
      await expect(
        validate("DOWNSTACK", true)
      ).to.not.eventually.be.rejectedWith(Error);

      scene.repo.checkoutBranch("b");
      await expect(validate("DOWNSTACK", true)).to.eventually.be.rejectedWith(
        Error
      );

      scene.repo.checkoutBranch("c");
      await expect(validate("DOWNSTACK", true)).to.eventually.be.rejectedWith(
        Error
      );

      scene.repo.checkoutBranch("d");
      await expect(validate("DOWNSTACK", true)).to.eventually.be.rejectedWith(
        Error
      );
    });

    it("Can validate fullstack", async () => {
      scene.repo.createChange("a");
      scene.repo.execCliCommand(`branch create "a" -s`);
      await expect(
        validate("FULLSTACK", true)
      ).to.not.eventually.be.rejectedWith(Error);

      scene.repo.createChange("b");
      scene.repo.execCliCommand(`branch create "b" -s`);
      await expect(
        validate("FULLSTACK", true)
      ).to.not.eventually.be.rejectedWith(Error);

      scene.repo.createAndCheckoutBranch("c");
      scene.repo.createChangeAndCommit("c");
      await expect(validate("FULLSTACK", true)).to.eventually.be.rejectedWith(
        Error
      );
    });
  });
}
