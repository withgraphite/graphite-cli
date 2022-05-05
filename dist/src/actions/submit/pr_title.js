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
exports.inferPRTitle = exports.getPRTitle = void 0;
const prompts_1 = __importDefault(require("prompts"));
const errors_1 = require("../../lib/errors");
const utils_1 = require("../../lib/utils");
function getPRTitle(args, context) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const title = inferPRTitle(args.branch, context);
        if (!args.editPRFieldsInline) {
            return title;
        }
        const response = yield prompts_1.default({
            type: 'text',
            name: 'title',
            message: 'Title',
            initial: title,
        }, {
            onCancel: () => {
                throw new errors_1.KilledError();
            },
        });
        return (_a = response.title) !== null && _a !== void 0 ? _a : title;
    });
}
exports.getPRTitle = getPRTitle;
function inferPRTitle(branch, context) {
    var _a, _b;
    const priorSubmitTitle = branch.getPriorSubmitTitle();
    if (priorSubmitTitle !== undefined) {
        return priorSubmitTitle;
    }
    // Only infer the title from the commit if the branch has just 1 commit.
    const singleCommitSubject = (_a = utils_1.getSingleCommitOnBranch(branch, context)) === null || _a === void 0 ? void 0 : _a.messageSubject().trim();
    if (singleCommitSubject === null || singleCommitSubject === void 0 ? void 0 : singleCommitSubject.length) {
        return singleCommitSubject;
    }
    return `Merge ${branch.name} into ${(_b = branch.getParentFromMeta(context)) === null || _b === void 0 ? void 0 : _b.name}`;
}
exports.inferPRTitle = inferPRTitle;
//# sourceMappingURL=pr_title.js.map