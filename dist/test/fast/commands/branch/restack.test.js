"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const all_scenes_1 = require("../../../lib/scenes/all_scenes");
const configure_test_1 = require("../../../lib/utils/configure_test");
const expect_commits_1 = require("../../../lib/utils/expect_commits");
for (const scene of all_scenes_1.allScenes) {
    // eslint-disable-next-line max-lines-per-function
    describe(`(${scene}): downstack restack`, function () {
        (0, configure_test_1.configureTest)(this, scene);
        it('Can restack one branch', () => {
            scene.repo.createChange('a', 'a');
            scene.repo.execCliCommand("branch create 'a' -m 'a' -q");
            scene.repo.createChange('b', 'b');
            scene.repo.execCliCommand("branch create 'b' -m 'b' -q");
            scene.repo.checkoutBranch('a');
            scene.repo.createChangeAndCommit('1.5', '1.5');
            scene.repo.checkoutBranch('b');
            scene.repo.execCliCommand('branch restack -q');
            (0, chai_1.expect)(scene.repo.currentBranchName()).to.eq('b');
            (0, expect_commits_1.expectCommits)(scene.repo, 'b, 1.5, a, 1');
        });
    });
}
//# sourceMappingURL=restack.test.js.map