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
const errors_1 = require("../lib/errors");
const assert_unreachable_1 = require("../lib/utils/assert_unreachable");
const trunk_1 = require("../lib/utils/trunk");
const branch_1 = require("../wrapper-classes/branch");
function fixDanglingBranches(context, opts) {
    return __awaiter(this, void 0, void 0, function* () {
        context.splog.logInfo(`Ensuring tracked branches in Graphite are all well-formed...`);
        if (opts.showSyncTip) {
            context.splog.logInfo(`Disable this behavior at any point in the future with --no-show-dangling`);
        }
        const danglingBranches = branch_1.Branch.allBranches(context, {
            filter: (b) => !b.isTrunk(context) && b.getParentFromMeta(context) === undefined,
        });
        if (danglingBranches.length === 0) {
            context.splog.logInfo(`All branches well-formed.`);
            context.splog.logNewline();
            return;
        }
        context.splog.logNewline();
        console.log(chalk_1.default.yellow(`Found branches without a known parent to Graphite. This may cause issues detecting stacks; we recommend you select one of the proposed remediations or use \`gt upstack onto\` to restack the branch onto the appropriate parent.`));
        context.splog.logTip(`To ensure Graphite always has a known parent for your branch, create your branch through Graphite with \`gt branch create <branch_name>\`.`);
        context.splog.logNewline();
        const trunk = trunk_1.getTrunk(context).name;
        for (const branch of danglingBranches) {
            let fixStrategy = undefined;
            if (opts.force) {
                fixStrategy = 'parent_trunk';
                context.splog.logInfo(`Setting parent of ${branch.name} to ${trunk}.`);
            }
            else if (!context.interactive) {
                fixStrategy = 'no_fix';
                context.splog.logInfo(`Skipping fix in non-interactive mode. Use '--force' to set parent to ${trunk}).`);
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
        context.splog.logNewline();
    });
}
exports.fixDanglingBranches = fixDanglingBranches;
//# sourceMappingURL=fix_dangling_branches.js.map