"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const fs_extra_1 = __importDefault(require("fs-extra"));
const scenes_1 = require("../../../lib/scenes");
const utils_1 = require("../../../lib/utils");
for (const scene of [new scenes_1.TrailingProdScene()]) {
    describe(`(${scene}): repo init`, function () {
        utils_1.configureTest(this, scene);
        it("Can run init in a fresh repo", () => {
            const repoConfigPath = `${scene.repo.dir}/.git/.graphite_repo_config`;
            fs_extra_1.default.removeSync(repoConfigPath);
            scene.repo.execCliCommand("repo init --trunk main --ignore-branches prod");
            const savedConfig = JSON.parse(fs_extra_1.default.readFileSync(repoConfigPath).toString());
            chai_1.expect(savedConfig["trunk"]).to.eq("main");
            chai_1.expect(savedConfig["ignoreBranches"][0]).to.eq("prod");
        });
        it("Cannot set an invalid trunk", () => {
            chai_1.expect(() => scene.repo.execCliCommand("repo init --trunk random")).to.throw(Error);
        });
    });
}
//# sourceMappingURL=init.test.js.map