"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureTest = void 0;
const cache_1 = require("../../../src/lib/config/cache");
function configureTest(suite, scene) {
    suite.timeout(600000);
    suite.beforeEach(() => {
        cache_1.cache.clearAll();
        scene.setup();
    });
    suite.afterEach(() => {
        scene.cleanup();
    });
}
exports.configureTest = configureTest;
//# sourceMappingURL=configure_test.js.map