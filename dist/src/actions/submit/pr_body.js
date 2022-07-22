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
const pr_templates_1 = require("../../lib/utils/pr_templates");
const run_command_1 = require("../../lib/utils/run_command");
async function getPRBody(args, context) {
    const { body, skipDescription } = inferPRBody({ branchName: args.branchName, template: await (0, pr_templates_1.getPRTemplate)() }, context);
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
                title: `Skip (${skipDescription})`,
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
    const file = tmp_1.default.fileSync({ name: 'EDIT_DESCRIPTION' });
    fs_extra_1.default.writeFileSync(file.name, args.initial);
    (0, run_command_1.runCommand)({
        command: args.editor,
        args: [file.name],
        options: { stdio: 'inherit' },
        onError: 'throw',
    });
    const contents = fs_extra_1.default.readFileSync(file.name).toString();
    file.removeCallback();
    return contents;
}
function inferPRBody({ branchName, template = '' }, context) {
    const priorSubmitBody = context.metaCache.getPrInfo(branchName)?.body;
    if (priorSubmitBody !== undefined) {
        return {
            body: priorSubmitBody,
            skipDescription: 'use body from aborted submit',
        };
    }
    if (!context.userConfig.data.submitIncludeCommitMessages) {
        return {
            body: template,
            skipDescription: template ? 'paste template' : 'leave empty',
        };
    }
    const messages = context.metaCache
        .getAllCommits(branchName, 'MESSAGE')
        .reverse();
    const isSingleCommit = messages.length === 1;
    const commitMessages = isSingleCommit
        ? messages[0].split('\n').slice(1).join('\n').trim()
        : messages.join('\n\n');
    return {
        body: `${commitMessages}${commitMessages && template ? '\n\n' : ''}${template}`,
        skipDescription: `paste commit message${isSingleCommit ? '' : 's'}${template ? ' and template' : ''}`,
    };
}
exports.inferPRBody = inferPRBody;
//# sourceMappingURL=pr_body.js.map