"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addAll = void 0;
const errors_1 = require("../errors");
const exec_sync_1 = require("../utils/exec_sync");
function addAll() {
    (0, exec_sync_1.gpExecSync)({
        command: 'git add --all',
    }, (err) => {
        throw new errors_1.ExitFailedError('Failed to add changes. Aborting...', err);
    });
}
exports.addAll = addAll;
//# sourceMappingURL=add_all.js.map