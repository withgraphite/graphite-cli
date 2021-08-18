import { expect } from "chai";
import { getOwnerAndNameFromURLForTesting } from "../../../../src/lib/config";
import { BasicScene } from "../../../lib/scenes";
import { configureTest } from "../../../lib/utils";

for (const scene of [new BasicScene()]) {
  describe(`(${scene}): infer repo owner/name`, function () {
    configureTest(this, scene);

    it("Can infer cloned repos", () => {
      const { owner, name } = getOwnerAndNameFromURLForTesting(
        "https://github.com/screenplaydev/graphite-cli.git"
      );
      expect(owner === "screenplaydev").to.be.true;
      expect(name === "graphite-cli").to.be.true;
    });

    it("Can infer SSH cloned repos", () => {
      const { owner, name } = getOwnerAndNameFromURLForTesting(
        "git@github.com:screenplaydev/graphite-cli.git"
      );
      expect(owner === "screenplaydev").to.be.true;
      expect(name === "graphite-cli").to.be.true;
    });

    // Not sure where these are coming from but we should be able to handle
    // them.
    it("Can infer cloned repos without .git", () => {
      const clone = getOwnerAndNameFromURLForTesting(
        "https://github.com/screenplaydev/graphite-cli"
      );
      expect(clone.owner === "screenplaydev").to.be.true;
      expect(clone.name === "graphite-cli").to.be.true;

      let sshClone = getOwnerAndNameFromURLForTesting(
        "git@github.com:screenplaydev/graphite-cli"
      );
      expect(sshClone.owner === "screenplaydev").to.be.true;
      expect(sshClone.name === "graphite-cli").to.be.true;
    });
  });
}
