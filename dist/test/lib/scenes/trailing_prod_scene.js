"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrailingProdScene = void 0;
const child_process_1 = require("child_process");
const abstract_scene_1 = require("./abstract_scene");
class TrailingProdScene extends abstract_scene_1.AbstractScene {
    toString() {
        return "TrailingProdScene";
    }
    setup() {
        super.setup();
        this.repo.createChangeAndCommit("0");
        this.repo.createAndCheckoutBranch("prod");
        this.repo.createChangeAndCommit("prod", "prod");
        this.repo.checkoutBranch("main");
        this.repo.createChangeAndCommit("0.5", "0.5");
        // Create a dangling branch as well, to cause a little chaos.
        this.repo.createAndCheckoutBranch("x1");
        this.repo.createChangeAndCommit("x1", "x1");
        this.repo.createAndCheckoutBranch("x2");
        this.repo.createChangeAndCommit("x2", "x2");
        this.repo.execCliCommand(`branch parent --set x1`);
        this.repo.deleteBranch("x1");
        child_process_1.execSync(`git -C "${this.dir}" merge prod`);
        this.repo.checkoutBranch("main");
        this.repo.createChangeAndCommit("1", "1");
        this.repo.execCliCommand("repo init --trunk main --ignore-branches prod x2");
    }
}
exports.TrailingProdScene = TrailingProdScene;
//# sourceMappingURL=trailing_prod_scene.js.map