"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const public_repo_scene_1 = require("./lib/scenes/public_repo_scene");
const configure_test_1 = require("./lib/utils/configure_test");
for (const scene of [
    new public_repo_scene_1.PublicRepoScene({
        repoUrl: 'https://github.com/SmartThingsCommunity/SmartThingsPublic.git',
        name: 'SmartThingsPublic',
        timeout: 20000,
    }),
    new public_repo_scene_1.PublicRepoScene({
        repoUrl: 'https://github.com/dagster-io/dagster.git',
        name: 'Dagster',
        timeout: 10000,
    }),
]) {
    describe(`(${scene}): Run simple timed commands`, function () {
        (0, configure_test_1.configureTest)(this, scene);
        it('Can run stacks quickly', () => {
            scene.repo.execCliCommand(`log short`);
        }).timeout(scene.timeout);
        it('Can run log quickly', () => {
            scene.repo.execCliCommand(`log`);
        }).timeout(scene.timeout);
    });
}
//# sourceMappingURL=large_repo.test.js.map