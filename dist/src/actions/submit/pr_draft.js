"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPRDraftStatus = void 0;
const prompts_1 = __importDefault(require("prompts"));
const errors_1 = require("../../lib/errors");
async function getPRDraftStatus(context) {
    if (!context.interactive) {
        return true;
    }
    const response = await (0, prompts_1.default)({
        type: 'select',
        name: 'draft',
        message: 'Submit',
        choices: [
            { title: 'Publish Pull Request', value: 'publish' },
            { title: 'Create Draft Pull Request', value: 'draft' },
        ],
    }, {
        onCancel: () => {
            throw new errors_1.KilledError();
        },
    });
    return response.draft === 'draft';
}
exports.getPRDraftStatus = getPRDraftStatus;
//# sourceMappingURL=pr_draft.js.map