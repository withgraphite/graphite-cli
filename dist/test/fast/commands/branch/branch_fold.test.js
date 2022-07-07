"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const all_scenes_1 = require("../../../lib/scenes/all_scenes");
const configure_test_1 = require("../../../lib/utils/configure_test");
const expect_branches_1 = require("../../../lib/utils/expect_branches");
const expect_commits_1 = require("../../../lib/utils/expect_commits");
for (const scene of all_scenes_1.allScenes) {
    describe(`(${scene}): fold`, function () {
        (0, configure_test_1.configureTest)(this, scene);
        it("Can't fold from trunk or into trunk", () => {
            scene.repo.createChange('a', 'a');
            scene.repo.execCliCommand(`branch create "a" -m "a" -q`);
            (0, chai_1.expect)(() => scene.repo.execCliCommand(`branch fold`)).to.throw();
            (0, chai_1.expect)(() => scene.repo.execCliCommand(`branch fold --keep`)).to.throw();
            scene.repo.execCliCommand(`branch down`);
            (0, chai_1.expect)(() => scene.repo.execCliCommand(`branch fold`)).to.throw();
            (0, chai_1.expect)(() => scene.repo.execCliCommand(`branch fold --keep`)).to.throw();
        });
        it('Can fold without --keep and restack children accordingly', () => {
            scene.repo.createChange('a', 'a');
            scene.repo.execCliCommand(`branch create "a" -m "a" -q`);
            scene.repo.createChange('b', 'b');
            scene.repo.execCliCommand(`branch create "b" -m "b" -q`);
            scene.repo.createChange('c', 'c');
            scene.repo.execCliCommand(`branch create "c" -m "c" -q`);
            scene.repo.execCliCommand(`branch down 2`);
            scene.repo.createChange('d', 'd');
            scene.repo.execCliCommand(`branch create "d" -m "d" -q`);
            scene.repo.checkoutBranch('b');
            scene.repo.execCliCommand(`branch fold`);
            (0, expect_branches_1.expectBranches)(scene.repo, 'a, c, d, main');
            (0, expect_commits_1.expectCommits)(scene.repo, 'b, a, 1');
            scene.repo.execCliCommand(`branch down`);
            (0, expect_commits_1.expectCommits)(scene.repo, '1');
            scene.repo.checkoutBranch('c');
            (0, expect_commits_1.expectCommits)(scene.repo, 'c, b, a, 1');
            scene.repo.checkoutBranch('d');
            (0, expect_commits_1.expectCommits)(scene.repo, 'd, b, a, 1');
        });
        it('Can fold with --keep and restack children accordingly', () => {
            scene.repo.createChange('a', 'a');
            scene.repo.execCliCommand(`branch create "a" -m "a" -q`);
            scene.repo.createChange('b', 'b');
            scene.repo.execCliCommand(`branch create "b" -m "b" -q`);
            scene.repo.createChange('c', 'c');
            scene.repo.execCliCommand(`branch create "c" -m "c" -q`);
            scene.repo.execCliCommand(`branch down 2`);
            scene.repo.createChange('d', 'd');
            scene.repo.execCliCommand(`branch create "d" -m "d" -q`);
            scene.repo.checkoutBranch('b');
            scene.repo.execCliCommand(`branch fold --keep`);
            (0, expect_branches_1.expectBranches)(scene.repo, 'b, c, d, main');
            (0, expect_commits_1.expectCommits)(scene.repo, 'b, a, 1');
            scene.repo.execCliCommand(`branch down`);
            (0, expect_commits_1.expectCommits)(scene.repo, '1');
            scene.repo.checkoutBranch('c');
            (0, expect_commits_1.expectCommits)(scene.repo, 'c, b, a, 1');
            scene.repo.checkoutBranch('d');
            (0, expect_commits_1.expectCommits)(scene.repo, 'd, b, a, 1');
        });
    });
}
//# sourceMappingURL=branch_fold.test.js.map