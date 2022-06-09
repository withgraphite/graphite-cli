"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setRemoteTracking = void 0;
const exec_sync_1 = require("../utils/exec_sync");
function setRemoteTracking({ remote, branchName, sha, }) {
    (0, exec_sync_1.gpExecSync)({ command: `git update-ref refs/remotes/${remote}/${branchName} ${sha}` }, (err) => {
        throw err;
    });
}
exports.setRemoteTracking = setRemoteTracking;
//# sourceMappingURL=set_remote_tracking.js.map