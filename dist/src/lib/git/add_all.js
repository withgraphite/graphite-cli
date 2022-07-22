"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addAll = void 0;
const run_command_1 = require("../utils/run_command");
function addAll() {
    (0, run_command_1.runGitCommand)({
        args: ['add', '--all'],
        onError: 'throw',
        resource: 'addAll',
    });
}
exports.addAll = addAll;
//# sourceMappingURL=add_all.js.map