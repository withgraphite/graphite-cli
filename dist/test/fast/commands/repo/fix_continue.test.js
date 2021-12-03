"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const scenes_1 = require("../../../lib/scenes");
const utils_1 = require("../../../lib/utils");
const fake_squash_and_merge_1 = require("../../../lib/utils/fake_squash_and_merge");
for (const scene of scenes_1.allScenes) {
    // eslint-disable-next-line max-lines-per-function
    describe(`(${scene}): repo fix continue`, function () {
        utils_1.configureTest(this, scene);
        it("Can continue a repo sync with one merge conflict", () => __awaiter(this, void 0, void 0, function* () {
            scene.repo.checkoutBranch("main");
            scene.repo.createChange("a", "file_with_no_merge_conflict_a");
            scene.repo.execCliCommand(`branch create "a" -m "a" -q`);
            scene.repo.checkoutBranch("main");
            scene.repo.createChange("b", "file_with_no_merge_conflict_b");
            scene.repo.execCliCommand(`branch create "b" -m "b" -q`);
            scene.repo.createChange("c", "file_with_merge_conflict");
            scene.repo.execCliCommand(`branch create "c" -m "c" -q`);
            scene.repo.checkoutBranch("main");
            scene.repo.createChange("d", "file_with_merge_conflict");
            scene.repo.execCliCommand(`branch create "d" -m "d" -q`);
            scene.repo.checkoutBranch("main");
            scene.repo.createChange("e", "file_with_no_merge_conflict_e");
            scene.repo.execCliCommand(`branch create "e" -m "e" -q`);
            utils_1.expectBranches(scene.repo, "a, b, c, d, e, main");
            // Squashing all but branch (c) which will have a merge conflict when
            // it's rebased onto trunk.
            fake_squash_and_merge_1.fakeGitSquashAndMerge(scene.repo, "a", "squash");
            fake_squash_and_merge_1.fakeGitSquashAndMerge(scene.repo, "b", "squash");
            fake_squash_and_merge_1.fakeGitSquashAndMerge(scene.repo, "d", "squash");
            fake_squash_and_merge_1.fakeGitSquashAndMerge(scene.repo, "e", "squash");
            scene.repo.execCliCommand(`repo fix -qf`);
            chai_1.expect(scene.repo.rebaseInProgress()).to.be.true;
            scene.repo.resolveMergeConflicts();
            scene.repo.markMergeConflictsAsResolved();
            const output = scene.repo.execCliCommandAndGetOutput("continue --no-edit");
            // Continue correctly finishes the command including the upsell at the
            // end to submit feedback.
            chai_1.expect(output.includes("Still seeing issues with Graphite?")).to.be.true;
            utils_1.expectBranches(scene.repo, "c, main");
        }));
        it("Can continue a repo sync with multiple merge conflicts", () => {
            scene.repo.checkoutBranch("main");
            scene.repo.createChange("a", "file_with_no_merge_conflict_a");
            scene.repo.execCliCommand(`branch create "a" -m "a" -q`);
            scene.repo.checkoutBranch("main");
            scene.repo.createChange("b", "file_with_no_merge_conflict_b");
            scene.repo.execCliCommand(`branch create "b" -m "b" -q`);
            scene.repo.createChange("c", "file_with_merge_conflict_1");
            scene.repo.execCliCommand(`branch create "c" -m "c" -q`);
            scene.repo.createChange("d", "file_with_merge_conflict_2");
            scene.repo.execCliCommand(`branch create "d" -m "d" -q`);
            scene.repo.checkoutBranch("main");
            scene.repo.createChange("e", "file_with_merge_conflict_1");
            scene.repo.execCliCommand(`branch create "e" -m "e" -q`);
            scene.repo.checkoutBranch("main");
            scene.repo.createChange("f", "file_with_merge_conflict_2");
            scene.repo.execCliCommand(`branch create "f" -m "f" -q`);
            utils_1.expectBranches(scene.repo, "a, b, c, d, e, f, main");
            fake_squash_and_merge_1.fakeGitSquashAndMerge(scene.repo, "a", "squash");
            fake_squash_and_merge_1.fakeGitSquashAndMerge(scene.repo, "b", "squash");
            fake_squash_and_merge_1.fakeGitSquashAndMerge(scene.repo, "e", "squash");
            fake_squash_and_merge_1.fakeGitSquashAndMerge(scene.repo, "f", "squash");
            scene.repo.execCliCommand(`repo fix -qf`);
            chai_1.expect(scene.repo.rebaseInProgress()).to.be.true;
            scene.repo.resolveMergeConflicts();
            scene.repo.markMergeConflictsAsResolved();
            scene.repo.execCliCommand("continue --no-edit");
            chai_1.expect(scene.repo.rebaseInProgress()).to.be.true;
            scene.repo.resolveMergeConflicts();
            scene.repo.markMergeConflictsAsResolved();
            scene.repo.execCliCommand("continue --no-edit");
            utils_1.expectBranches(scene.repo, "c, d, main");
        });
    });
}
//# sourceMappingURL=fix_continue.test.js.map