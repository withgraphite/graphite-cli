#! /usr/bin/env ts-node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.build = void 0;
const child_process_1 = require("child_process");
function build() {
    console.log("building...");
    (0, child_process_1.execSync)(`rm -rf ./dist`), { stdio: "inherit" };
    (0, child_process_1.execSync)(`yarn install --immutable`, { stdio: "ignore" });
    (0, child_process_1.execSync)(`yarn build`, { stdio: "ignore" });
    (0, child_process_1.execSync)(`rm -rf ./node_modules`), { stdio: "ignore" };
    console.log("done building");
}
exports.build = build;
//# sourceMappingURL=build.js.map