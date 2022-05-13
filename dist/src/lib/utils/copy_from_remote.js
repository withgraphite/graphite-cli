"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.copyFromRemote = void 0;
const errors_1 = require("../errors");
const exec_sync_1 = require("./exec_sync");
function copyFromRemote(branch, remote) {
    exec_sync_1.gpExecSync({
        command: `git branch -fq "${branch}" "${remote}/${branch}"`,
    }, () => {
        throw new errors_1.ExitFailedError(`Failed to copy ${branch} from remote.`);
    });
}
exports.copyFromRemote = copyFromRemote;
//# sourceMappingURL=copy_from_remote.js.map