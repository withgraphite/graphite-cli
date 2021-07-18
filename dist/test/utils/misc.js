"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.execCliCommand = void 0;
const child_process_1 = require("child_process");
function execCliCommand(command, opts) {
    child_process_1.execSync(`NODE_ENV=development node ${__dirname}/../../dist/src/index.js ${command}`, {
        stdio: "inherit",
        cwd: opts.fromDir,
    });
}
exports.execCliCommand = execCliCommand;
//# sourceMappingURL=misc.js.map