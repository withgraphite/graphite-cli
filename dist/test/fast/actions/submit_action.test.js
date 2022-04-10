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
const child_process_1 = require("child_process");
const submit_1 = require("../../../src/actions/submit");
const branch_1 = require("../../../src/wrapper-classes/branch");
const scenes_1 = require("../../lib/scenes");
const utils_1 = require("../../lib/utils");
for (const scene of [new scenes_1.BasicScene()]) {
    describe(`(${scene}): correctly infers submit info from commits`, function () {
        utils_1.configureTest(this, scene);
        it('can infer title/body from single commit', () => __awaiter(this, void 0, void 0, function* () {
            const title = 'Test Title';
            const body = ['Test body line 1.', 'Test body line 2.'].join('\n');
            scene.repo.execCliCommand(`branch create "a" -m "a" -q`);
            child_process_1.execSync(`git reset HEAD~1 --hard`);
            scene.repo.createChange('a');
            child_process_1.execSync(`git commit -m "${title}" -m "${body}"`);
            const branch = yield branch_1.Branch.branchWithName('a', scene.context);
            chai_1.expect(submit_1.inferPRTitle(branch, scene.context)).to.equals(title);
            chai_1.expect(submit_1.inferPRBody(branch, scene.context)).to.equals(body);
        }));
        it('can infer just title with no body', () => __awaiter(this, void 0, void 0, function* () {
            const title = 'Test Title';
            const commitMessage = title;
            scene.repo.createChange('a');
            scene.repo.execCliCommand(`branch create "a" -m "${commitMessage}" -q`);
            const branch = yield branch_1.Branch.branchWithName('a', scene.context);
            chai_1.expect(submit_1.inferPRTitle(branch, scene.context)).to.equals(title);
            chai_1.expect(submit_1.inferPRBody(branch, scene.context)).to.be.null;
        }));
        it('does not infer title/body for multiple commits', () => __awaiter(this, void 0, void 0, function* () {
            const title = 'Test Title';
            const commitMessage = title;
            scene.repo.createChange('a');
            scene.repo.execCliCommand(`branch create "a" -m "${commitMessage}" -q`);
            scene.repo.createChangeAndCommit(commitMessage);
            const branch = yield branch_1.Branch.branchWithName('a', scene.context);
            chai_1.expect(submit_1.inferPRTitle(branch, scene.context)).to.not.equals(title);
            chai_1.expect(submit_1.inferPRBody(branch, scene.context)).to.be.null;
        }));
    });
}
//# sourceMappingURL=submit_action.test.js.map