"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commit = void 0;
const escape_for_shell_1 = require("../utils/escape_for_shell");
const exec_sync_1 = require("../utils/exec_sync");
function commit(opts) {
    (0, exec_sync_1.gpExecSync)({
        command: [
            'git commit',
            opts.amend ? `--amend` : '',
            opts.message ? `-m ${(0, escape_for_shell_1.q)(opts.message)}` : '',
            opts.noEdit ? `--no-edit` : '',
            opts.edit ? `-e` : '',
            opts.patch ? `-p` : '',
            opts.noVerify ? '-n' : '',
        ].join(' '),
        options: {
            stdio: 'inherit',
        },
        onError: () => {
            opts.rollbackOnError?.();
        },
    });
}
exports.commit = commit;
//# sourceMappingURL=commit.js.map