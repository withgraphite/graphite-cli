"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const graphite_cli_routes_1 = require("@withgraphite/graphite-cli-routes");
const chai_1 = require("chai");
const fs_extra_1 = __importDefault(require("fs-extra"));
const nock_1 = __importDefault(require("nock"));
const server_1 = require("../../../src/lib/api/server");
const metadata_ref_1 = require("../../../src/lib/engine/metadata_ref");
const all_scenes_1 = require("../../lib/scenes/all_scenes");
const configure_test_1 = require("../../lib/utils/configure_test");
const expect_branches_1 = require("../../lib/utils/expect_branches");
const expect_commits_1 = require("../../lib/utils/expect_commits");
const fake_squash_and_merge_1 = require("../../lib/utils/fake_squash_and_merge");
for (const scene of all_scenes_1.allScenes) {
    // eslint-disable-next-line max-lines-per-function
    describe(`(${scene}): repo sync`, function () {
        (0, configure_test_1.configureTest)(this, scene);
        beforeEach(() => {
            // We need to stub out the endpoint that sends back information on
            // the GitHub PRs associated with each branch.
            (0, nock_1.default)(server_1.API_SERVER).post(graphite_cli_routes_1.API_ROUTES.pullRequestInfo.url).reply(200, {
                prs: [],
            });
            // Querying this endpoint requires a repo owner and name so we set
            // that here too. Note that these values are meaningless (for now)
            // and just need to exist.
            scene.repo.runCliCommand([`repo`, `owner`, `-s`, `integration_test`]);
            scene.repo.runCliCommand([`repo`, `name`, `-s`, `integration-test-repo`]);
        });
        afterEach(() => {
            nock_1.default.restore();
        });
        it('Can delete a single merged branch', async () => {
            scene.repo.createChange('2', 'a');
            scene.repo.runCliCommand([`branch`, `create`, `a`, `-m`, `a`]);
            (0, expect_branches_1.expectBranches)(scene.repo, 'a, main');
            (0, fake_squash_and_merge_1.fakeGitSquashAndMerge)(scene.repo, 'a', 'squash');
            scene.repo.runCliCommand([`repo`, `owner`]);
            scene.repo.runCliCommand([`repo`, `sync`, `-f`, `--no-pull`]);
            (0, expect_branches_1.expectBranches)(scene.repo, 'main');
        });
        it('Can delete a branch marked as merged', async () => {
            scene.repo.createChange('2', 'a');
            scene.repo.runCliCommand([`branch`, `create`, `a`, `-m`, `a`]);
            (0, expect_branches_1.expectBranches)(scene.repo, 'a, main');
            (0, metadata_ref_1.writeMetadataRef)('a', { ...(0, metadata_ref_1.readMetadataRef)('a', scene.dir), prInfo: { state: 'MERGED' } }, scene.dir);
            scene.repo.runCliCommand([`repo`, `owner`]);
            scene.repo.runCliCommand([`repo`, `sync`, `-f`, `--no-pull`]);
            (0, expect_branches_1.expectBranches)(scene.repo, 'main');
        });
        it('Can delete a branch marked as closed', async () => {
            scene.repo.createChange('2', 'a');
            scene.repo.runCliCommand([`branch`, `create`, `a`, `-m`, `a`]);
            (0, expect_branches_1.expectBranches)(scene.repo, 'a, main');
            (0, metadata_ref_1.writeMetadataRef)('a', { ...(0, metadata_ref_1.readMetadataRef)('a', scene.dir), prInfo: { state: 'CLOSED' } }, scene.dir);
            scene.repo.runCliCommand([`repo`, `owner`]);
            scene.repo.runCliCommand([`repo`, `sync`, `-f`, `--no-pull`]);
            (0, expect_branches_1.expectBranches)(scene.repo, 'main');
        });
        it('Can noop sync if there are no stacks', () => {
            (0, chai_1.expect)(() => scene.repo.runCliCommand([`repo`, `sync`, `-f`, `--no-pull`])).to.not.throw(Error);
        });
        it('Can delete the foundation of a double stack and restack it', async () => {
            scene.repo.createChange('2', 'a');
            scene.repo.runCliCommand([`branch`, `create`, `a`, `-m`, `a`]);
            scene.repo.createChange('3', 'b');
            scene.repo.runCliCommand([`branch`, `create`, `b`, `-m`, `b`]);
            (0, expect_branches_1.expectBranches)(scene.repo, 'a, b, main');
            (0, fake_squash_and_merge_1.fakeGitSquashAndMerge)(scene.repo, 'a', 'squash');
            scene.repo.runCliCommand([
                `repo`,
                `sync`,
                `-f`,
                `--no-pull`,
                `--restack`,
            ]);
            (0, expect_branches_1.expectBranches)(scene.repo, 'b, main');
            (0, expect_commits_1.expectCommits)(scene.repo, 'squash, 1');
            scene.repo.checkoutBranch('b');
            (0, expect_commits_1.expectCommits)(scene.repo, 'b, squash, 1');
        });
        it('Can delete two branches off a three-stack', async () => {
            scene.repo.createChange('2', 'a');
            scene.repo.runCliCommand([`branch`, `create`, `a`, `-m`, `a`]);
            scene.repo.createChange('3', 'b');
            scene.repo.runCliCommand([`branch`, `create`, `b`, `-m`, `b`]);
            scene.repo.createChange('4', 'c');
            scene.repo.runCliCommand([`branch`, `create`, `c`, `-m`, `c`]);
            (0, expect_branches_1.expectBranches)(scene.repo, 'a, b, c, main');
            (0, fake_squash_and_merge_1.fakeGitSquashAndMerge)(scene.repo, 'a', 'squash_a');
            (0, fake_squash_and_merge_1.fakeGitSquashAndMerge)(scene.repo, 'b', 'squash_b');
            scene.repo.runCliCommand([`repo`, `sync`, `-f`, `--no-pull`]);
            (0, expect_branches_1.expectBranches)(scene.repo, 'c, main');
            (0, expect_commits_1.expectCommits)(scene.repo, 'squash_b, squash_a, 1');
        });
        it('Can delete two branches, while syncing inbetween, off a three-stack', async () => {
            scene.repo.createChange('2', 'a');
            scene.repo.runCliCommand([`branch`, `create`, `a`, `-m`, `a`]);
            scene.repo.createChange('3', 'b');
            scene.repo.runCliCommand([`branch`, `create`, `b`, `-m`, `b`]);
            scene.repo.createChange('4', 'c');
            scene.repo.runCliCommand([`branch`, `create`, `c`, `-m`, `c`]);
            (0, expect_branches_1.expectBranches)(scene.repo, 'a, b, c, main');
            (0, fake_squash_and_merge_1.fakeGitSquashAndMerge)(scene.repo, 'a', 'squash_a');
            scene.repo.runCliCommand([`repo`, `sync`, `-f`, `--no-pull`]);
            (0, fake_squash_and_merge_1.fakeGitSquashAndMerge)(scene.repo, 'b', 'squash_b');
            scene.repo.runCliCommand([`repo`, `sync`, `-f`, `--no-pull`]);
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