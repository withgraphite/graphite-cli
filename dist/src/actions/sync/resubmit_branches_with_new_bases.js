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
exports.resubmitBranchesWithNewBases = void 0;
const prompts_1 = __importDefault(require("prompts"));
const utils_1 = require("../../lib/utils");
const branch_1 = require("../../wrapper-classes/branch");
const submit_1 = require("../submit");
function resubmitBranchesWithNewBases(force, context) {
    return __awaiter(this, void 0, void 0, function* () {
        const needsResubmission = [];
        branch_1.Branch.allBranchesWithFilter({
            filter: (b) => {
                var _a;
                const prState = (_a = b.getPRInfo()) === null || _a === void 0 ? void 0 : _a.state;
                return (!b.isTrunk(context) &&
                    b.getParentFromMeta(context) !== undefined &&
                    prState !== 'MERGED' &&
                    prState !== 'CLOSED');
            },
        }, context).forEach((b) => {
            var _a, _b;
            const currentBase = (_a = b.getParentFromMeta(context)) === null || _a === void 0 ? void 0 : _a.name;
            const githubBase = (_b = b.getPRInfo()) === null || _b === void 0 ? void 0 : _b.base;
            if (githubBase && githubBase !== currentBase) {
                needsResubmission.push(b);
            }
        });
        if (needsResubmission.length === 0) {
            return;
        }
        utils_1.logNewline();
        utils_1.logInfo([
            `The following branches appear to have been rebased (or cherry-picked) in your local repo but changes have not yet propagated to PR (remote):`,
            ...needsResubmission.map((b) => `- ${b.name}`),
        ].join('\n'));
        utils_1.logTip(`Disable this check at any point in the future with --no-resubmit`, context);
        // Prompt for resubmission.
        let resubmit = force;
        if (!force) {
            const response = yield prompts_1.default({
                type: 'confirm',
                name: 'value',
                message: `Update PR to propagate local rebase changes? (PR will be re-submitted)`,
                initial: true,
            });
            resubmit = response.value;
        }
        if (resubmit) {
            utils_1.logInfo(`Updating PR to propagate local rebase changes...`);
            yield submit_1.submitAction({
                scope: 'FULLSTACK',
                editPRFieldsInline: false,
                draftToggle: false,
                dryRun: false,
                updateOnly: false,
                branchesToSubmit: needsResubmission,
                reviewers: false,
            }, context);
        }
    });
}
exports.resubmitBranchesWithNewBases = resubmitBranchesWithNewBases;
//# sourceMappingURL=resubmit_branches_with_new_bases.js.map