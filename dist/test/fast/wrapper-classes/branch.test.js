"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const branch_1 = __importDefault(require("../../../src/wrapper-classes/branch"));
const scenes_1 = require("../../lib/scenes");
const utils_1 = require("../../lib/utils");
for (const scene of scenes_1.allScenes) {
    describe(`(${scene}): branch class`, function () {
        utils_1.configureTest(this, scene);
        it("Can list git parent for a branch", () => {
            scene.repo.createChange("2");
            scene.repo.execCliCommand(`branch create a -m "a" -q`);
            const branch = new branch_1.default("a");
            chai_1.expect(branch.getParentsFromGit()[0].name).to.equal("main");
        });
        it("Can list parent based on meta for a branch", () => {
            var _a;
            scene.repo.createChange("2");
            scene.repo.execCliCommand(`branch create "a" -q`);
            const branch = new branch_1.default("a");
            chai_1.expect(branch.getParentFromMeta()).is.not.undefined;
            chai_1.expect((_a = branch.getParentFromMeta()) === null || _a === void 0 ? void 0 : _a.name).to.equal("main");
        });
        it("Can fetch branches that point to the same commit", () => {
            scene.repo.createAndCheckoutBranch("a");
            scene.repo.createChangeAndCommit("2");
            scene.repo.createAndCheckoutBranch("b");
            scene.repo.createAndCheckoutBranch("c");
            chai_1.expect(new branch_1.default("a")
                .branchesWithSameCommit()
                .map((b) => b.name)
                .sort()
                .join(", ")).to.eq("b, c");
        });
    });
}
//# sourceMappingURL=branch.test.js.map