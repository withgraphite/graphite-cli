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
const graphite_cli_routes_1 = __importDefault(require("@screenplaydev/graphite-cli-routes"));
const chai_1 = require("chai");
const nock_1 = __importDefault(require("nock"));
const api_1 = require("../../../../src/lib/api");
const scenes_1 = require("../../../lib/scenes");
const utils_1 = require("../../../lib/utils");
const fake_squash_and_merge_1 = require("../../../lib/utils/fake_squash_and_merge");
for (const scene of scenes_1.allScenes) {
    // eslint-disable-next-line max-lines-per-function
    describe(`(${scene}): repo sync continue`, function () {
        utils_1.configureTest(this, scene);
        beforeEach(() => {
            // We need to stub out the endpoint that sends back information on
            // the GitHub PRs associated with each branch.
            nock_1.default(api_1.API_SERVER).post(graphite_cli_routes_1.default.pullRequestInfo.url).reply(200, {
                prs: [],
            });
            // Querying this endpoint requires a repo owner and name so we set
            // that here too. Note that these values are meaningless (for now)
            // and just need to exist.
            scene.repo.execCliCommandAndGetOutput(`repo owner -s "integration_test"`);
            scene.repo.execCliCommandAndGetOutput(`repo name -s "integration-test-repo"`);
        });
        afterEach(() => {
            nock_1.default.restore();
        });
        it('Can continue a repo sync with one merge conflict', () => __awaiter(this, void 0, void 0, function* () {
            scene.repo.checkoutBranch('main');
            scene.repo.createChange('a', 'file_with_no_merge_conflict_a');
            scene.repo.execCliCommand(`branch create "a" -m "a" -q`);
            scene.repo.checkoutBranch('main');
            scene.repo.createChange('b', 'file_with_no_merge_conflict_b');
            scene.repo.execCliCommand(`branch create "b" -m "b" -q`);
            scene.repo.createChange('c', 'file_with_merge_conflict');
            scene.repo.execCliCommand(`branch create "c" -m "c" -q`);
            scene.repo.checkoutBranch('main');
            scene.repo.createChange('d', 'file_with_merge_conflict');
            scene.repo.execCliCommand(`branch create "d" -m "d" -q`);
            scene.repo.checkoutBranch('main');
            scene.repo.createChange('e', 'file_with_no_merge_conflict_e');
            scene.repo.execCliCommand(`branch create "e" -m "e" -q`);
            utils_1.expectBranches(scene.repo, 'a, b, c, d, e, main');
            // Squashing all but branch (c) which will have a merge conflict when
            // it's rebased onto trunk.
            fake_squash_and_merge_1.fakeGitSquashAndMerge(scene.repo, 'a', 'squash');
            fake_squash_and_merge_1.fakeGitSquashAndMerge(scene.repo, 'b', 'squash');
            fake_squash_and_merge_1.fakeGitSquashAndMerge(scene.repo, 'd', 'squash');
            fake_squash_and_merge_1.fakeGitSquashAndMerge(scene.repo, 'e', 'squash');
            scene.repo.execCliCommand(`repo sync -qf --no-pull --no-resubmit`);
            chai_1.expect(scene.repo.rebaseInProgress()).to.be.true;
            scene.repo.resolveMergeConflicts();
            scene.repo.markMergeConflictsAsResolved();
            scene.repo.execCliCommand('continue --no-edit');
            utils_1.expectBranches(scene.repo, 'c, main');
        }));
        it('Can continue a repo sync with multiple merge conflicts', () => {
            scene.repo.checkoutBranch('main');
            scene.repo.createChange('a', 'file_with_no_merge_conflict_a');
            scene.repo.execCliCommand(`branch create "a" -m "a" -q`);
            scene.repo.checkoutBranch('main');
            scene.repo.createChange('b', 'file_with_no_merge_conflict_b');
            scene.repo.execCliCommand(`branch create "b" -m "b" -q`);
            scene.repo.createChange('c', 'file_with_merge_conflict_1');
            scene.repo.execCliCommand(`branch create "c" -m "c" -q`);
            scene.repo.createChange('d', 'file_with_merge_conflict_2');
            scene.repo.execCliCommand(`branch create "d" -m "d" -q`);
            scene.repo.checkoutBranch('main');
            scene.repo.createChange('e', 'file_with_merge_conflict_1');
            scene.repo.execCliCommand(`branch create "e" -m "e" -q`);
            scene.repo.checkoutBranch('main');
            scene.repo.createChange('f', 'file_with_merge_conflict_2');
            scene.repo.execCliCommand(`branch create "f" -m "f" -q`);
            utils_1.expectBranches(scene.repo, 'a, b, c, d, e, f, main');
            fake_squash_and_merge_1.fakeGitSquashAndMerge(scene.repo, 'a', 'squash');
            fake_squash_and_merge_1.fakeGitSquashAndMerge(scene.repo, 'b', 'squash');
            fake_squash_and_merge_1.fakeGitSquashAndMerge(scene.repo, 'e', 'squash');
            fake_squash_and_merge_1.fakeGitSquashAndMerge(scene.repo, 'f', 'squash');
            scene.repo.execCliCommand(`repo sync -qf --no-pull --no-resubmit`);
            chai_1.expect(scene.repo.rebaseInProgress()).to.be.true;
            scene.repo.resolveMergeConflicts();
            scene.repo.markMergeConflictsAsResolved();
            scene.repo.execCliCommand('continue --no-edit');
            chai_1.expect(scene.repo.rebaseInProgress()).to.be.true;
            scene.repo.resolveMergeConflicts();
            scene.repo.markMergeConflictsAsResolved();
            scene.repo.execCliCommand('continue --no-edit');
            utils_1.expectBranches(scene.repo, 'c, d, main');
        });
    });
}
//# sourceMappingURL=sync_continue.test.js.map