"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.inferPRBody = exports.getPRBody = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const prompts_1 = __importDefault(require("prompts"));
const tmp_1 = __importDefault(require("tmp"));
const errors_1 = require("../../lib/errors");
const commit_message_1 = require("../../lib/git/commit_message");
const exec_sync_1 = require("../../lib/utils/exec_sync");
const pr_templates_1 = require("../../lib/utils/pr_templates");
async function getPRBody(args, context) {
    const body = inferPRBody(args.branchName, context) ?? (await (0, pr_templates_1.getPRTemplate)()) ?? '';
    if (!args.editPRFieldsInline) {
        return body;
    }
    const editor = context.userConfig.getEditor();
    const response = await (0, prompts_1.default)({
        type: 'select',
        name: 'body',
        message: 'Body',
        choices: [
            { title: `Edit Body (using ${editor})`, value: 'edit' },
            {
                title: `Skip${body ? ` (just paste template)` : ''}`,
                value: 'skip',
            },
        ],
    }, {
        onCancel: () => {
            throw new errors_1.KilledError();
        },
    });
    if (response.body === 'skip') {
        return body;
    }
    return await editPRBody({
        initial: body,
        editor,
    });
}
exports.getPRBody = getPRBody;
async function editPRBody(args) {
    const file = tmp_1.default.fileSync();
    fs_extra_1.default.writeFileSync(file.name, args.initial);
    (0, exec_sync_1.gpExecSync)({
        command: `${args.editor} ${file.name}`,
        options: { stdio: 'inherit' },
    });
    const contents = fs_extra_1.default.readFileSync(file.name).toString();
    file.removeCallback();
    return contents;
}
function inferPRBody(branchName, context) {
    const priorSubmitBody = context.metaCache.getPrInfo(branchName)?.body;
    if (priorSubmitBody !== undefined) {
        return priorSubmitBody;
    }
    // Only infer the title from the commit if the branch has just 1 commit.
    const commits = context.metaCache.getAllCommits(branchName, 'SHA');
    const singleCommitBody = commits.length === 1 ? (0, commit_message_1.getCommitMessage)(commits[0], 'BODY') : undefined;
    return singleCommitBody?.length ? singleCommitBody : undefined;
}
exports.inferPRBody = inferPRBody;
//# sourceMappingURL=pr_body.js.map