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
exports.inferPRBody = exports.getPRBody = void 0;
const child_process_1 = require("child_process");
const fs_extra_1 = __importDefault(require("fs-extra"));
const prompts_1 = __importDefault(require("prompts"));
const tmp_1 = __importDefault(require("tmp"));
const errors_1 = require("../../lib/errors");
const utils_1 = require("../../lib/utils");
const default_editor_1 = require("../../lib/utils/default_editor");
const pr_templates_1 = require("../../lib/utils/pr_templates");
function getPRBody(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const template = yield pr_templates_1.getPRTemplate();
        const inferredBodyFromCommit = inferPRBody(args.branch);
        let body = inferredBodyFromCommit !== null ? inferredBodyFromCommit : template;
        const hasPRTemplate = body !== undefined;
        if (args.editPRFieldsInline) {
            const defaultEditor = yield default_editor_1.getDefaultEditorOrPrompt();
            const response = yield prompts_1.default({
                type: "select",
                name: "body",
                message: "Body",
                choices: [
                    { title: `Edit Body (using ${defaultEditor})`, value: "edit" },
                    {
                        title: `Skip${hasPRTemplate ? ` (just paste template)` : ""}`,
                        value: "skip",
                    },
                ],
            }, {
                onCancel: () => {
                    throw new errors_1.KilledError();
                },
            });
            if (response.body === "edit") {
                body = yield editPRBody({
                    initial: body !== null && body !== void 0 ? body : "",
                    editor: defaultEditor,
                });
            }
        }
        return body !== null && body !== void 0 ? body : "";
    });
}
exports.getPRBody = getPRBody;
function editPRBody(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const file = tmp_1.default.fileSync();
        fs_extra_1.default.writeFileSync(file.name, args.initial);
        child_process_1.execSync(`${args.editor} ${file.name}`, { stdio: "inherit" });
        const contents = fs_extra_1.default.readFileSync(file.name).toString();
        file.removeCallback();
        return contents;
    });
}
function inferPRBody(branch) {
    const priorSubmitBody = branch.getPriorSubmitBody();
    if (priorSubmitBody !== undefined) {
        return priorSubmitBody;
    }
    // Only infer the title from the commit if the branch has just 1 commit.
    const singleCommit = utils_1.getSingleCommitOnBranch(branch);
    const singleCommitBody = singleCommit === null ? null : singleCommit.messageBody().trim();
    if (singleCommitBody !== null && singleCommitBody.length > 0) {
        return singleCommitBody;
    }
    return null;
}
exports.inferPRBody = inferPRBody;
//# sourceMappingURL=pr_body.js.map