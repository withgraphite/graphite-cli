"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrailingProdScene = void 0;
const child_process_1 = require("child_process");
const metadata_ref_1 = require("../../../src/lib/engine/metadata_ref");
const get_sha_1 = require("../../../src/lib/git/get_sha");
const abstract_scene_1 = require("./abstract_scene");
class TrailingProdScene extends abstract_scene_1.AbstractScene {
    toString() {
        return 'TrailingProdScene';
    }
    setup() {
        super.setup();
        this.repo.createChangeAndCommit('0');
        this.repo.createAndCheckoutBranch('prod');
        this.repo.createChangeAndCommit('prod', 'prod');
        this.repo.checkoutBranch('main');
        this.repo.createChangeAndCommit('0.5', '0.5');
        // Create a dangling branch as well, to cause a little chaos.
        this.repo.createAndCheckoutBranch('x1');
        this.repo.createChangeAndCommit('x1', 'x1');
        this.repo.createAndCheckoutBranch('x2');
        this.repo.createChangeAndCommit('x2', 'x2');
        (0, metadata_ref_1.writeMetadataRef)('x2', {
            parentBranchName: 'x1',
            parentBranchRevision: (0, get_sha_1.getShaOrThrow)('x1'),
        }, this.repo.dir);
        this.repo.deleteBranch('x1');
        (0, child_process_1.execSync)(`git -C "${this.dir}" merge prod`);
        this.repo.checkoutBranch('main');
        this.repo.createChangeAndCommit('1', '1');
        this.repo.execCliCommand('repo init --trunk main --no-interactive');
    }
}
exports.TrailingProdScene = TrailingProdScene;
//# sourceMappingURL=trailing_prod_scene.js.map