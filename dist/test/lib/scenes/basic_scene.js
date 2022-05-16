"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasicScene = void 0;
const abstract_scene_1 = require("./abstract_scene");
class BasicScene extends abstract_scene_1.AbstractScene {
    toString() {
        return 'BasicScene';
    }
    setup() {
        super.setup();
        this.repo.createChangeAndCommit('1', '1');
    }
}
exports.BasicScene = BasicScene;
//# sourceMappingURL=basic_scene.js.map