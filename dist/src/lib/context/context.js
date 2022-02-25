"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initContext = void 0;
const repo_config_1 = require("./../config/repo_config");
function initContext() {
    return { repoConfig: repo_config_1.repoConfigFactory.load() };
}
exports.initContext = initContext;
//# sourceMappingURL=context.js.map