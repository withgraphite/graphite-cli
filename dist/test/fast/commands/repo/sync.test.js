"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const graphite_cli_routes_1 = __importDefault(require("@withgraphite/graphite-cli-routes"));
const chai_1 = require("chai");
const fs_extra_1 = __importDefault(require("fs-extra"));
const nock_1 = __importDefault(require("nock"));
const server_1 = require("../../../../src/lib/api/server");
const all_scenes_1 = require("../../../lib/scenes/all_scenes");
const configure_test_1 = require("../../../lib/utils/configure_test");
const expect_branches_1 = require("../../../lib/utils/expect_branches");
const expect_commits_1 = require("../../../lib/utils/expect_commits");
const fake_squash_and_merge_1 = require("../../../lib/utils/fake_squash_and_merge");
for (const scene of all_scenes_1.allScenes) {
    // eslint-disable-next-line max-lines-per-function
    describe(`(${scene}): repo sync`, function () {
        (0, configure_test_1.configureTest)(this, scene);
        beforeEach(() => {
            // We need to stub out the endpoint that sends back information on
            // the GitHub PRs associated with each branch.
            (0, nock_1.default)(server_1.API_SERVER).post(graphite_cli_routes_1.default.pullRequestInfo.url).reply(200, {
                prs: [],
            });
            // Querying this endpoint requires a repo owner and name so we set
            // that here too. Note that these values are meaningless (for now)
            // and just need to exist.
            scene.repo.execCliCommand(`repo owner -s "integration_test"`);
            scene.repo.execCliCommand(`repo name -s "integration-test-repo"`);
        });
        afterEach(() => {
            nock_1.default.restore();
        });
        it('Can delete a single merged branch', async () => {
            scene.repo.createChange('2', 'a');
            scene.repo.execCliCommand(`branch create "a" -m "a" -q`);
            (0, expect_branches_1.expectBranches)(scene.repo, 'a, main');
            (0, fake_squash_and_merge_1.fakeGitSquashAndMerge)(scene.repo, 'a', 'squash');
            scene.repo.execCliCommand(`repo owner`);
            scene.repo.execCliCommand(`repo sync -qf --no-pull`);
            (0, expect_branches_1.expectBranches)(scene.repo, 'main');
        });
        it('Can delete a branch marked as merged', async () => {
            scene.repo.createChange('2', 'a');
            scene.repo.execCliCommand(`branch create "a" -m "a" -q`);
            (0, expect_branches_1.expectBranches)(scene.repo, 'a, main');
            scene.repo.upsertMeta('a', { prInfo: { state: 'MERGED' } });
            scene.repo.execCliCommand(`repo owner`);
            scene.repo.execCliCommand(`repo sync -qf --no-pull`);
            (0, expect_branches_1.expectBranches)(scene.repo, 'main');
        });
        it('Can delete a branch marked as closed', async () => {
            scene.repo.createChange('2', 'a');
            scene.repo.execCliCommand(`branch create "a" -m "a" -q`);
            (0, expect_branches_1.expectBranches)(scene.repo, 'a, main');
            scene.repo.upsertMeta('a', { prInfo: { state: 'CLOSED' } });
            scene.repo.execCliCommand(`repo owner`);
            scene.repo.execCliCommand(`repo sync -qf --no-pull`);
            (0, expect_branches_1.expectBranches)(scene.repo, 'main');
        });
        it('Can noop sync if there are no stacks', () => {
            (0, chai_1.expect)(() => scene.repo.execCliCommand(`repo sync -qf --no-pull`)).to.not.throw(Error);
        });
        it('Can delete the foundation of a double stack and restack it', async () => {
            scene.repo.createChange('2', 'a');
            scene.repo.execCliCommand(`branch create "a" -m "a" -q`);
            scene.repo.createChange('3', 'b');
            scene.repo.execCliCommand(`branch create "b" -m "b" -q`);
            (0, expect_branches_1.expectBranches)(scene.repo, 'a, b, main');
            (0, fake_squash_and_merge_1.fakeGitSquashAndMerge)(scene.repo, 'a', 'squash');
            scene.repo.execCliCommand(`repo sync -qf --no-pull --restack`);
            (0, expect_branches_1.expectBranches)(scene.repo, 'b, main');
            (0, expect_commits_1.expectCommits)(scene.repo, 'squash, 1');
            scene.repo.checkoutBranch('b');
            (0, expect_commits_1.expectCommits)(scene.repo, 'b, squash, 1');
        });
        it('Can delete two branches off a three-stack', async () => {
            scene.repo.createChange('2', 'a');
            scene.repo.execCliCommand(`branch create "a" -m "a" -q`);
            scene.repo.createChange('3', 'b');
            scene.repo.execCliCommand(`branch create "b" -m "b" -q`);
            scene.repo.createChange('4', 'c');
            scene.repo.execCliCommand(`branch create "c" -m "c" -q`);
            (0, expect_branches_1.expectBranches)(scene.repo, 'a, b, c, main');
            (0, fake_squash_and_merge_1.fakeGitSquashAndMerge)(scene.repo, 'a', 'squash_a');
            (0, fake_squash_and_merge_1.fakeGitSquashAndMerge)(scene.repo, 'b', 'squash_b');
            scene.repo.execCliCommand(`repo sync -qf --no-pull`);
            (0, expect_branches_1.expectBranches)(scene.repo, 'c, main');
            (0, expect_commits_1.expectCommits)(scene.repo, 'squash_b, squash_a, 1');
        });
        it('Can delete two branches, while syncing inbetween, off a three-stack', async () => {
            scene.repo.createChange('2', 'a');
            scene.repo.execCliCommand(`branch create "a" -m "a" -q`);
            scene.repo.createChange('3', 'b');
            scene.repo.execCliCommand(`branch create "b" -m "b" -q`);
            scene.repo.createChange('4', 'c');
            scene.repo.execCliCommand(`branch create "c" -m "c" -q`);
            (0, expect_branches_1.expectBranches)(scene.repo, 'a, b, c, main');
            (0, fake_squash_and_merge_1.fakeGitSquashAndMerge)(scene.repo, 'a', 'squash_a');
            scene.repo.execCliCommand(`repo sync -qf --no-pull`);
            (0, fake_squash_and_merge_1.fakeGitSquashAndMerge)(scene.repo, 'b', 'squash_b');
            scene.repo.execCliCommand(`repo sync -qf --no-pull`);
            (0, expect_branches_1.expectBranches)(scene.repo, 'c, main');
            (0, expect_commits_1.expectCommits)(scene.repo, 'squash_b, squash_a, 1');
            const metadata = fs_extra_1.default.readdirSync(`${scene.repo.dir}/.git/refs/branch-metadata`);
            (0, chai_1.expect)(metadata.includes('a')).to.be.false;
            (0, chai_1.expect)(metadata.includes('b')).to.be.false;
            (0, chai_1.expect)(metadata.includes('c')).to.be.true;
        });
    });
}
//# sourceMappingURL=sync.test.js.map