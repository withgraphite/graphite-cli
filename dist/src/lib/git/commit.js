"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commit = void 0;
const run_command_1 = require("../utils/run_command");
function commit(opts) {
    (0, run_command_1.runGitCommand)({
        args: [
            'commit',
            ...(opts.amend ? [`--amend`] : []),
            ...(opts.message ? [`-m`, opts.message] : []),
            ...(opts.noEdit ? [`--no-edit`] : []),
            ...(opts.edit ? [`-e`] : []),
            ...(opts.patch ? [`-p`] : []),
            ...(opts.noVerify ? ['-n'] : []),
        ],
        options: {
            stdio: 'inherit',
        },
        onError: () => {
            opts.rollbackOnError?.();
        },
        resource: 'commit',
    });
}
exports.commit = commit;
//# sourceMappingURL=commit.js.map