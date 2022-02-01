"use strict";
exports.__esModule = true;
exports.checkoutBranch = void 0;
var errors_1 = require("../errors");
var index_1 = require("./index");
function checkoutBranch(branch) {
    index_1.gpExecSync({ command: "git checkout -q \"" + branch + "\"" }, function (err) {
        throw new errors_1.ExitFailedError("Failed to checkout branch (" + branch + ")", err);
    });
}
exports.checkoutBranch = checkoutBranch;
