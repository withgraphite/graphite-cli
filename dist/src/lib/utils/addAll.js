"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addAll = void 0;
const _1 = require(".");
const errors_1 = require("../errors");
function addAll() {
    _1.gpExecSync({
        command: 'git add --all',
    }, (err) => {
        throw new errors_1.ExitFailedError('Failed to add changes. Aborting...', err);
    });
}
exports.addAll = addAll;
//# sourceMappingURL=addAll.js.map