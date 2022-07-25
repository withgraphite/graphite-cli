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
async function getPRBody(args, context) {
    const priorSubmitBody = context.metaCache.getPrInfo(args.branchName)?.body;
    const { inferredBody, skipDescription } = inferPRBody({ branchName: args.branchName, template: await (0, pr_templates_1.getPRTemplate)() }, context);
    if (!args.editPRFieldsInline) {
        return priorSubmitBody ?? inferredBody;
    }
    const usePriorSubmitBody = !!priorSubmitBody &&
        (await (0, prompts_1.default)({
            type: 'confirm',
            name: 'confirm',
            initial: true,
            message: 'Detected a PR body from an aborted submit, use it?',
        }, {
            onCancel: () => {
                throw new errors_1.KilledError();
            },
        })).confirm;
    const body = usePriorSubmitBody ? priorSubmitBody : inferredBody;
    const response = await (0, prompts_1.default)({
        type: 'select',
        name: 'body',
        message: 'Body',
        choices: [
            {
                title: `Edit Body (using ${context.userConfig.getEditor()})`,
                value: 'edit',
            },
            {
                title: `Skip (${usePriorSubmitBody
                    ? `use body from aborted submit`
                    : skipDescription})`,
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
    return await editPRBody(body, context);
}
exports.getPRBody = getPRBody;
async function editPRBody(initial, context) {
    const file = tmp_1.default.fileSync({ name: 'EDIT_DESCRIPTION' });
    fs_extra_1.default.writeFileSync(file.name, initial);
    context.userConfig.execEditor(file.name);
    const contents = fs_extra_1.default.readFileSync(file.name).toString();
    file.removeCallback();
    return contents;
}
function inferPRBody({ branchName, template = '' }, context) {
    if (!context.userConfig.data.submitIncludeCommitMessages) {
        return {
            inferredBody: template,
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
        inferredBody: `${commitMessages}${commitMessages && template ? '\n\n' : ''}${template}`,
        skipDescription: `paste commit message${isSingleCommit ? '' : 's'}${template ? ' and template' : ''}`,
    };
}
exports.inferPRBody = inferPRBody;
//# sourceMappingURL=pr_body.js.map