"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkoutBranch = void 0;
const errors_1 = require("../errors");
const exec_sync_1 = require("../utils/exec_sync");
function checkoutBranch(branch, opts) {
    exec_sync_1.gpExecSync({
        command: `git switch ${(opts === null || opts === void 0 ? void 0 : opts.quiet) ? '-q' : ''} ${(opts === null || opts === void 0 ? void 0 : opts.new) ? '-c' : ''}"${branch}"`,
    }, () => {
        throw new errors_1.ExitFailedError(`Failed to checkout ${(opts === null || opts === void 0 ? void 0 : opts.new) ? 'new ' : ''}branch (${branch})`);
    });
}
exports.checkoutBranch = checkoutBranch;
//# sourceMappingURL=checkout_branch.js.map