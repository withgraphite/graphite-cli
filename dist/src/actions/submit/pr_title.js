"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPRTitle = void 0;
const prompts_1 = __importDefault(require("prompts"));
const errors_1 = require("../../lib/errors");
async function getPRTitle(args, context) {
    // First check if we have a saved title from a failed submit;
    // otherwise, use the subject of the oldest commit on the branch.
    const title = context.metaCache.getPrInfo(args.branchName)?.title ??
        context.metaCache.getAllCommits(args.branchName, 'SUBJECT').reverse()[0];
    if (!args.editPRFieldsInline) {
        return title;
    }
    const response = await (0, prompts_1.default)({
        type: 'text',
        name: 'title',
        message: 'Title',
        initial: title,
    }, {
        onCancel: () => {
            throw new errors_1.KilledError();
        },
    });
    return response.title ?? title;
}
exports.getPRTitle = getPRTitle;
//# sourceMappingURL=pr_title.js.map