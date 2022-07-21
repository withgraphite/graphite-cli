"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGitEditor = void 0;
const exec_sync_1 = require("../utils/exec_sync");
function getGitEditor() {
    const editor = (0, exec_sync_1.gpExecSync)({
        command: `git config --global core.editor`,
        onError: 'ignore',
    });
    return editor.length > 0 ? editor : undefined;
}
exports.getGitEditor = getGitEditor;
//# sourceMappingURL=git_editor.js.map