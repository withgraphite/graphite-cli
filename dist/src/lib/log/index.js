"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = void 0;
function log(message, opts = { silent: false }) {
    if (!opts.silent) {
        console.log(message);
    }
}
exports.log = log;
//# sourceMappingURL=index.js.map