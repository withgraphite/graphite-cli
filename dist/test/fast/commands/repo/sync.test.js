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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const graphite_cli_routes_1 = __importDefault(require("@withgraphite/graphite-cli-routes"));
const chai_1 = require("chai");
const child_process_1 = require("child_process");
const fs_extra_1 = __importDefault(require("fs-extra"));
const nock_1 = __importDefault(require("nock"));
const api_1 = require("../../../../src/lib/api");
const all_scenes_1 = require("../../../lib/scenes/all_scenes");
const configure_test_1 = require("../../../lib/utils/configure_test");
const expect_branches_1 = require("../../../lib/utils/expect_branches");
const expect_commits_1 = require("../../../lib/utils/expect_commits");
const fake_squash_and_merge_1 = require("../../../lib/utils/fake_squash_and_merge");
for (const scene of all_scenes_1.allScenes) {
    // eslint-disable-next-line max-lines-per-function
    describe(`(${scene}): repo sync`, function () {
        configure_test_1.configureTest(this, scene);
        beforeEach(() => {
            // We need to stub out the endpoint that sends back information on
            // the GitHub PRs associated with each branch.
            nock_1.default(api_1.API_SERVER).post(graphite_cli_routes_1.default.pullRequestInfo.url).reply(200, {
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
        it('Can delete a single merged branch', () => __awaiter(this, void 0, void 0, function* () {
            scene.repo.createChange('2', 'a');
            scene.repo.execCliCommand(`branch create "a" -m "a" -q`);
            expect_branches_1.expectBranches(scene.repo, 'a, main');
            fake_squash_and_merge_1.fakeGitSquashAndMerge(scene.repo, 'a', 'squash');
            scene.repo.execCliCommand(`repo owner`);
            scene.repo.execCliCommand(`repo sync -qf --no-pull --no-resubmit`);
            expect_branches_1.expectBranches(scene.repo, 'main');
        }));
        it('Can noop sync if there are no stacks', () => {
            chai_1.expect(() => scene.repo.execCliCommand(`repo sync -qf --no-pull --no-resubmit`)).to.not.throw(Error);
        });
        it('Can delete the foundation of a double stack', () => __awaiter(this, void 0, void 0, function* () {
            scene.repo.createChange('2', 'a');
            scene.repo.execCliCommand(`branch create "a" -m "a" -q`);
            scene.repo.createChange('3', 'b');
            scene.repo.execCliCommand(`branch create "b" -m "b" -q`);
            expect_branches_1.expectBranches(scene.repo, 'a, b, main');
            fake_squash_and_merge_1.fakeGitSquashAndMerge(scene.repo, 'a', 'squash');
            scene.repo.execCliCommand(`repo sync -qf --no-pull --no-resubmit`);
            expect_branches_1.expectBranches(scene.repo, 'b, main');
            expect_commits_1.expectCommits(scene.repo, 'squash, 1');
            scene.repo.checkoutBranch('b');
            expect_commits_1.expectCommits(scene.repo, 'b, squash, 1');
        }));
        it('Can delete two branches off a three-stack', () => __awaiter(this, void 0, void 0, function* () {
            scene.repo.createChange('2', 'a');
            scene.repo.execCliCommand(`branch create "a" -m "a" -q`);
            scene.repo.createChange('3', 'b');
            scene.repo.execCliCommand(`branch create "b" -m "b" -q`);
            scene.repo.createChange('4', 'c');
            scene.repo.execCliCommand(`branch create "c" -m "c" -q`);
            expect_branches_1.expectBranches(scene.repo, 'a, b, c, main');
            fake_squash_and_merge_1.fakeGitSquashAndMerge(scene.repo, 'a', 'squash_a');
            fake_squash_and_merge_1.fakeGitSquashAndMerge(scene.repo, 'b', 'squash_b');
            scene.repo.execCliCommand(`repo sync -qf --no-pull --no-resubmit`);
            expect_branches_1.expectBranches(scene.repo, 'c, main');
            expect_commits_1.expectCommits(scene.repo, 'squash_b, squash_a, 1');
        }));
        it('Can delete two branches, while syncing inbetween, off a three-stack', () => __awaiter(this, void 0, void 0, function* () {
            scene.repo.createChange('2', 'a');
            scene.repo.execCliCommand(`branch create "a" -m "a" -q`);
            scene.repo.createChange('3', 'b');
            scene.repo.execCliCommand(`branch create "b" -m "b" -q`);
            scene.repo.createChange('4', 'c');
            scene.repo.execCliCommand(`branch create "c" -m "c" -q`);
            expect_branches_1.expectBranches(scene.repo, 'a, b, c, main');
            fake_squash_and_merge_1.fakeGitSquashAndMerge(scene.repo, 'a', 'squash_a');
            scene.repo.execCliCommand(`repo sync -qf --no-pull --no-resubmit`);
            fake_squash_and_merge_1.fakeGitSquashAndMerge(scene.repo, 'b', 'squash_b');
            scene.repo.execCliCommand(`repo sync -qf --no-pull --no-resubmit`);
            expect_branches_1.expectBranches(scene.repo, 'c, main');
            expect_commits_1.expectCommits(scene.repo, 'squash_b, squash_a, 1');
            const metadata = fs_extra_1.default.readdirSync(`${scene.repo.dir}/.git/refs/branch-metadata`);
            chai_1.expect(metadata.includes('a')).to.be.false;
            chai_1.expect(metadata.includes('b')).to.be.false;
            chai_1.expect(metadata.includes('c')).to.be.true;
        }));
        /**
         * Removed this functionality for now - users are reporting issues where
         * this was incorrectly deleting metadata for still-existing branches.
         *
         * https://graphite-community.slack.com/archives/C02DRNRA9RA/p1632897956089100
         * https://graphite-community.slack.com/archives/C02DRNRA9RA/p1634168133170500"
         */
        xit('Deletes dangling metadata refs', () => __awaiter(this, void 0, void 0, function* () {
            scene.repo.createChange('a', 'a');
            scene.repo.execCliCommand(`branch create "a" -m "a" -q`);
            scene.repo.createChange('b', 'b');
            scene.repo.execCliCommand(`branch create "b" -m "b" -q`);
            scene.repo.checkoutBranch('main');
            child_process_1.execSync(`git -C "${scene.repo.dir}" branch -D a`);
            let metadata = fs_extra_1.default.readdirSync(`${scene.repo.dir}/.git/refs/branch-metadata`);
            chai_1.expect(metadata.includes('a')).to.be.true;
            chai_1.expect(metadata.includes('b')).to.be.true;
            scene.repo.execCliCommand(`repo sync -qf --no-pull --no-resubmit`);
            metadata = fs_extra_1.default.readdirSync(`${scene.repo.dir}/.git/refs/branch-metadata`);
            chai_1.expect(metadata.includes('a')).to.be.false;
            chai_1.expect(metadata.includes('b')).to.be.true;
        }));
        xit('Can detect dead branches off multiple stacks', () => __awaiter(this, void 0, void 0, function* () {
            scene.repo.createChange('a', 'a');
            scene.repo.execCliCommand(`branch create "a" -m "a" -q`);
            scene.repo.createChange('b', 'b');
            scene.repo.execCliCommand(`branch create "b" -m "b" -q`);
            scene.repo.createChange('c', 'c');
            scene.repo.execCliCommand(`branch create "c" -m "c" -q`);
            expect_branches_1.expectBranches(scene.repo, 'a, b, c, main');
            scene.repo.checkoutBranch('main');
            scene.repo.createChange('d', 'd');
            scene.repo.execCliCommand(`branch create "d" -m "d" -q`);
            scene.repo.createChange('e', 'e');
            scene.repo.execCliCommand(`branch create "e" -m "e" -q`);
            fake_squash_and_merge_1.fakeGitSquashAndMerge(scene.repo, 'a', 'squash_a');
            fake_squash_and_merge_1.fakeGitSquashAndMerge(scene.repo, 'b', 'squash_b');
            fake_squash_and_merge_1.fakeGitSquashAndMerge(scene.repo, 'd', 'squash_d');
            scene.repo.execCliCommand(`repo sync -qf --no-pull --no-resubmit`);
            expect_branches_1.expectBranches(scene.repo, 'c, e, main');
            scene.repo.checkoutBranch('main');
            expect_commits_1.expectCommits(scene.repo, 'squash_d, squash_b, squash_a');
            scene.repo.checkoutBranch('c');
            expect_commits_1.expectCommits(scene.repo, 'c, squash_d, squash_b, squash_a');
            scene.repo.checkoutBranch('e');
            expect_commits_1.expectCommits(scene.repo, 'e, squash_d, squash_b, squash_a');
        }));
        it('Deletes merged, dangling branches that trail trunk', () => __awaiter(this, void 0, void 0, function* () {
            // We'll come back to this - for now we're just saving a place behind
            // main.
            scene.repo.createAndCheckoutBranch('dangling');
            scene.repo.checkoutBranch('main');
            scene.repo.createChangeAndCommit('2', '2');
            scene.repo.createChangeAndCommit('3', '3');
            scene.repo.createChangeAndCommit('4', '4');
            // Now create the dangling branch that trails main.
            scene.repo.checkoutBranch('dangling');
            scene.repo.createChangeAndCommit('a', 'a');
            scene.repo.checkoutBranch('main');
            expect_branches_1.expectBranches(scene.repo, 'dangling, main');
            fake_squash_and_merge_1.fakeGitSquashAndMerge(scene.repo, 'dangling', 'squash_dangling');
            // The idea here is that repo sync fixes dangling branch back onto main,
            // which then gets deleted as the deletion logic makes a pass through
            // all of trunk's children.
            scene.repo.execCliCommand(`repo sync -qf --no-pull --no-resubmit`);
            expect_branches_1.expectBranches(scene.repo, 'main');
        }));
    });
}
//# sourceMappingURL=sync.test.js.map