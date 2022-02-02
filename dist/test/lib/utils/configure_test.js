"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureTest = void 0;
const config_1 = require("../../../src/lib/config");
function configureTest(suite, scene) {
    suite.timeout(600000);
    suite.beforeEach(() => {
        config_1.cache.clearAll();
        scene.setup();
    });
    suite.afterEach(() => {
        scene.cleanup();
    });
}
exports.configureTest = configureTest;
//# sourceMappingURL=configure_test.js.map