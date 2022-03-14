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
exports.fixDanglingBranches = exports.existsDanglingBranches = void 0;
const chalk_1 = __importDefault(require("chalk"));
const prompts_1 = __importDefault(require("prompts"));
const errors_1 = require("../lib/errors");
const utils_1 = require("../lib/utils");
const branch_1 = require("../wrapper-classes/branch");
function existsDanglingBranches(context) {
    const danglingBranches = branch_1.Branch.allBranchesWithFilter({
        filter: (b) => !b.isTrunk(context) && b.getParentFromMeta(context) === undefined,
    }, context);
    return danglingBranches.length > 0;
}
exports.existsDanglingBranches = existsDanglingBranches;
function fixDanglingBranches(context, force) {
    return __awaiter(this, void 0, void 0, function* () {
        const danglingBranches = branch_1.Branch.allBranchesWithFilter({
            filter: (b) => !b.isTrunk(context) && b.getParentFromMeta(context) === undefined,
        }, context);
        const trunk = utils_1.getTrunk(context).name;
        for (const branch of danglingBranches) {
            let fixStrategy = undefined;
            if (force) {
                fixStrategy = 'parent_trunk';
                utils_1.logInfo(`Setting parent of ${branch.name} to ${trunk}.`);
            }
            if (fixStrategy === undefined) {
                const response = yield prompts_1.default({
                    type: 'select',
                    name: 'value',
                    message: `${branch.name}`,
                    choices: [
                        {
                            title: `Set ${chalk_1.default.green(`(${branch.name})`)}'s parent to ${trunk}`,
                            value: 'parent_trunk',
                        },
                        {
                            title: `Add ${chalk_1.default.green(`(${branch.name})`)} to the list of branches Graphite should ignore`,
                            value: 'ignore_branch',
                        },
                        { title: `Fix later`, value: 'no_fix' },
                    ],
                }, {
                    onCancel: () => {
                        throw new errors_1.KilledError();
                    },
                });
                switch (response.value) {
                    case 'parent_trunk':
                        fixStrategy = 'parent_trunk';
                        break;
                    case 'ignore_branch':
                        fixStrategy = 'ignore_branch';
                        break;
                    case 'no_fix':
                    default:
                        fixStrategy = 'no_fix';
                }
            }
            switch (fixStrategy) {
                case 'parent_trunk':
                    branch.setParentBranchName(trunk);
                    break;
                case 'ignore_branch':
                    context.repoConfig.addIgnoreBranchPatterns([branch.name]);
                    break;
                case 'no_fix':
                    break;
                default:
                    assertUnreachable(fixStrategy);
            }
        }
    });
}
exports.fixDanglingBranches = fixDanglingBranches;
// eslint-disable-next-line @typescript-eslint/no-empty-function
function assertUnreachable(arg) { }
//# sourceMappingURL=fix_dangling_branches.js.map