"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const all_scenes_1 = require("../../lib/scenes/all_scenes");
const configure_test_1 = require("../../lib/utils/configure_test");
const expect_commits_1 = require("../../lib/utils/expect_commits");
for (const scene of all_scenes_1.allScenes) {
    describe(`(${scene}): fold`, function () {
        (0, configure_test_1.configureTest)(this, scene);
        it('Can squash two commits into one and restack a child', () => {
            scene.repo.createChange('a', 'a');
            scene.repo.runCliCommand([`branch`, `create`, `a`, `-m`, `a`]);
            scene.repo.createChange('a2', 'a2');
            scene.repo.runCliCommand([`commit`, `create`, `-m`, `a2`]);
            scene.repo.createChange('b', 'b');
            scene.repo.runCliCommand([`branch`, `create`, `b`, `-m`, `b`]);
            (0, expect_commits_1.expectCommits)(scene.repo, 'b, a2, a, 1');
            scene.repo.runCliCommand([`branch`, `down`]);
            scene.repo.runCliCommand([`branch`, `squash`, `-n`]);
            scene.repo.runCliCommand([`branch`, `up`]);
            (0, expect_commits_1.expectCommits)(scene.repo, 'b, a, 1');
        });
    });
}
//# sourceMappingURL=branch_squash.test.js.map