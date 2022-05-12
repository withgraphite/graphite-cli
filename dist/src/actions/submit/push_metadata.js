"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pushMetadataRef = void 0;
const errors_1 = require("../../lib/errors");
const exec_sync_1 = require("../../lib/utils/exec_sync");
const splog_1 = require("../../lib/utils/splog");
const metadata_ref_1 = require("../../wrapper-classes/metadata_ref");
function pushMetadataRef(branch, context) {
    if (!context.userConfig.data.experimental) {
        return;
    }
    exec_sync_1.gpExecSync({
        command: `git push origin "+refs/branch-metadata/${branch.name}:refs/branch-metadata/${branch.name}" 2>&1`,
    }, (err) => {
        splog_1.logError(`Failed to push stack metadata for ${branch.name} to remote.`);
        throw new errors_1.ExitFailedError(err.stderr.toString());
    });
    metadata_ref_1.MetadataRef.copyMetadataRefToRemoteTracking(context.repoConfig.getRemote(), branch.name);
}
exports.pushMetadataRef = pushMetadataRef;
//# sourceMappingURL=push_metadata.js.map