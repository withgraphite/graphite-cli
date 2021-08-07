import { allScenes } from "../../scenes";
import { configureTest, expectCommits } from "../../utils";

for (const scene of allScenes) {
  describe(`(${scene}): commit create`, function () {
    configureTest(this, scene);

    it("Can amend a commit", () => {
      scene.repo.createChange("2");
      scene.repo.execCliCommand(`commit create -m "2" -q`);
      expectCommits(scene.repo, "2, 1");

      scene.repo.execCliCommand(`commit amend -m "3" -q`);
      expectCommits(scene.repo, "3, 1");

      scene.repo.execCliCommand(`commit amend --no-edit -q`);
      expectCommits(scene.repo, "3, 1");
    });

    it("Can amend if there are no staged changes", () => {
      scene.repo.execCliCommand(`commit amend -m "a" -q`);
      expectCommits(scene.repo, "a");
    });

    it("Automatically fixes upwards", () => {
      scene.repo.createChange("2", "2");
      scene.repo.execCliCommand(`branch create a -m "2" -q`);

      scene.repo.createChange("3", "3");
      scene.repo.execCliCommand(`branch create b -m "3" -q`);

      scene.repo.checkoutBranch("a");
      scene.repo.execCliCommand(`commit amend -m "2.5" -q`);

      scene.repo.checkoutBranch("b");
      expectCommits(scene.repo, "3, 2.5, 1");
    });
  });
}
