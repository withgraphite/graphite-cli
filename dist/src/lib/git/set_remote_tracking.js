"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setRemoteTracking = void 0;
const run_command_1 = require("../utils/run_command");
function setRemoteTracking({ remote, branchName, sha, }) {
    (0, run_command_1.runGitCommand)({
        args: [`update-ref`, `refs/remotes/${remote}/${branchName}`, sha],
        onError: 'throw',
        resource: 'setRemoteTracking',
    });
}
exports.setRemoteTracking = setRemoteTracking;
//# sourceMappingURL=set_remote_tracking.js.map