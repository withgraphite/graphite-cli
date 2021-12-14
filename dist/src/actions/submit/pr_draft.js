"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPRDraftStatus = void 0;
const prompts_1 = __importDefault(require("prompts"));
const errors_1 = require("../../lib/errors");
function getPRDraftStatus(args) {
    return __awaiter(this, void 0, void 0, function* () {
        let draft;
        if (args.createNewPRsAsDraft === undefined) {
            const response = yield (0, prompts_1.default)({
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
            draft = response.draft === 'draft' ? true : false;
        }
        else {
            draft = args.createNewPRsAsDraft;
        }
        return draft;
    });
}
exports.getPRDraftStatus = getPRDraftStatus;
//# sourceMappingURL=pr_draft.js.map