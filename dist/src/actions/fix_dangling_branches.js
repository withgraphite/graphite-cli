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
exports.fixDanglingBranches = void 0;
const chalk_1 = __importDefault(require("chalk"));
const prompts_1 = __importDefault(require("prompts"));
const exec_state_config_1 = require("../lib/config/exec_state_config");
const errors_1 = require("../lib/errors");
const utils_1 = require("../lib/utils");
const assert_unreachable_1 = require("../lib/utils/assert_unreachable");
const branch_1 = require("../wrapper-classes/branch");
function fixDanglingBranches(context, opts) {
    return __awaiter(this, void 0, void 0, function* () {
        utils_1.logInfo(`Ensuring tracked branches in Graphite are all well-formed...`);
        if (opts.showSyncTip) {
            utils_1.logTip(`Disable this behavior at any point in the future with --no-show-dangling`, context);
        }
        const danglingBranches = branch_1.Branch.allBranchesWithFilter({
            filter: (b) => !b.isTrunk(context) && b.getParentFromMeta(context) === undefined,
        }, context);
        if (danglingBranches.length === 0) {
            utils_1.logInfo(`All branches well-formed.`);
            utils_1.logNewline();
            return;
        }
        utils_1.logNewline();
        console.log(chalk_1.default.yellow(`Found branches without a known parent to Graphite. This may cause issues detecting stacks; we recommend you select one of the proposed remediations or use \`gt upstack onto\` to restack the branch onto the appropriate parent.`));
        utils_1.logTip(`To ensure Graphite always has a known parent for your branch, create your branch through Graphite with \`gt branch create <branch_name>\`.`, context);
        utils_1.logNewline();
        const trunk = utils_1.getTrunk(context).name;
        for (const branch of danglingBranches) {
            let fixStrategy = undefined;
            if (opts.force) {
                fixStrategy = 'parent_trunk';
                utils_1.logInfo(`Setting parent of ${branch.name} to ${trunk}.`);
            }
            else if (!exec_state_config_1.execStateConfig.interactive()) {
                fixStrategy = 'no_fix';
                utils_1.logInfo(`Skipping fix in non-interactive mode. Use '--force' to set parent to ${trunk}).`);
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
                    assert_unreachable_1.assertUnreachable(fixStrategy);
            }
        }
        utils_1.logNewline();
    });
}
exports.fixDanglingBranches = fixDanglingBranches;
//# sourceMappingURL=fix_dangling_branches.js.map