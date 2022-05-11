"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMergeBase = void 0;
const exec_sync_1 = require("./exec_sync");
function getMergeBase(left, right) {
    return exec_sync_1.gpExecSync({ command: `git merge-base ${left} ${right}` })
        .toString()
        .trim();
}
exports.getMergeBase = getMergeBase;
//# sourceMappingURL=merge_base.js.map