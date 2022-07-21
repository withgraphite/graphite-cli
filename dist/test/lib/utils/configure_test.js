"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureTest = void 0;
function configureTest(suite, scene) {
    suite.timeout(600000);
    suite.beforeEach(() => scene.setup());
    suite.afterEach(() => scene.cleanup());
}
exports.configureTest = configureTest;
//# sourceMappingURL=configure_test.js.map