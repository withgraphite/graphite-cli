"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addAll = void 0;
const exec_sync_1 = require("../utils/exec_sync");
function addAll() {
    (0, exec_sync_1.gpExecSync)({ command: 'git add --all', onError: 'throw' });
}
exports.addAll = addAll;
//# sourceMappingURL=add_all.js.map