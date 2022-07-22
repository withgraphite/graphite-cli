"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMergeBase = void 0;
const run_command_1 = require("../utils/run_command");
function getMergeBase(left, right) {
    return (0, run_command_1.runGitCommand)({
        args: [`merge-base`, left, right],
        onError: 'throw',
        resource: 'getMergeBase',
    });
}
exports.getMergeBase = getMergeBase;
//# sourceMappingURL=merge_base.js.map