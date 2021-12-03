"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const config_1 = require("../../../../src/lib/config");
const scenes_1 = require("../../../lib/scenes");
const utils_1 = require("../../../lib/utils");
for (const scene of [new scenes_1.BasicScene()]) {
    describe(`(${scene}): log settings tests`, function () {
        utils_1.configureTest(this, scene);
        it("Can read settings written using the CLI commands", () => {
            scene.repo.execCliCommand("repo max-stacks-behind-trunk -s 1");
            scene.repo.execCliCommand("repo max-days-behind-trunk -s 2");
            chai_1.expect(scene.repo
                .execCliCommandAndGetOutput("repo max-stacks-behind-trunk")
                .includes("1")).to.be.true;
            chai_1.expect(scene.repo
                .execCliCommandAndGetOutput("repo max-days-behind-trunk")
                .includes("2")).to.be.true;
        });
        it("Can read log settings written in the old log settings location", () => {
            const config = {
                trunk: "main",
                ignoreBranches: [],
                logSettings: {
                    maxStacksShownBehindTrunk: 5,
                    maxDaysShownBehindTrunk: 10,
                },
            };
            writeRepoConfig(config);
            chai_1.expect(scene.repo
                .execCliCommandAndGetOutput("repo max-stacks-behind-trunk")
                .includes("5")).to.be.true;
            chai_1.expect(scene.repo
                .execCliCommandAndGetOutput("repo max-days-behind-trunk")
                .includes("10")).to.be.true;
        });
    });
    function writeRepoConfig(newConfig) {
        fs_extra_1.default.writeFileSync(path_1.default.join(scene.dir, config_1.repoConfig.path()), JSON.stringify(newConfig, null, 2));
    }
}
//# sourceMappingURL=stack_settings.test.js.map