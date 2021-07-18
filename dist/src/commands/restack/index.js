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
exports.restackBranch = void 0;
const chalk_1 = __importDefault(require("chalk"));
const child_process_1 = require("child_process");
const log_1 = require("../../lib/log");
const utils_1 = require("../../lib/utils");
const branch_1 = __importDefault(require("../../wrapper-classes/branch"));
const abstract_command_1 = __importDefault(require("../abstract_command"));
const print_stacks_1 = __importDefault(require("../print-stacks"));
const validate_1 = __importDefault(require("../validate"));
const args = {
    silent: {
        describe: `silence output from the command`,
        demandOption: false,
        default: false,
        type: "boolean",
        alias: "s",
    },
    onto: {
        describe: `A branch to restack the current stack onto`,
        demandOption: false,
        optional: true,
        type: "string",
    },
};
function getParentForRebaseOnto(branch, argv) {
    const parent = branch.getParentFromMeta();
    if (!parent) {
        log_1.log(chalk_1.default.red(`Cannot "restack --onto", (${branch.name}) has no parent as defined by the meta.`), argv);
        process.exit(1);
    }
    return parent;
}
class RestackCommand extends abstract_command_1.default {
    _execute(argv) {
        return __awaiter(this, void 0, void 0, function* () {
            // Print state before
            log_1.log(`Before restack:`, argv);
            !argv.silent && (yield new print_stacks_1.default().executeUnprofiled(args));
            const originalBranch = branch_1.default.getCurrentBranch();
            if (argv.onto) {
                yield restackOnto(originalBranch, argv.onto, argv);
            }
            else {
                yield restackBranch(originalBranch, originalBranch.name, argv);
            }
            child_process_1.execSync(`git checkout -q ${originalBranch.name}`);
            // Print state after
            log_1.log(`After restack:`, argv);
            !argv.silent && (yield new print_stacks_1.default().executeUnprofiled(args));
        });
    }
}
exports.default = RestackCommand;
RestackCommand.args = args;
function checkBranchCanBeMoved(branch, opts) {
    if (utils_1.trunkBranches && branch.name in utils_1.trunkBranches) {
        log_1.log(chalk_1.default.red(`Cannot restack (${branch.name}) onto ${opts.onto}, (${branch.name}) is listed in (${utils_1.CURRENT_REPO_CONFIG_PATH}) as a trunk branch.`), opts);
        process.exit(1);
    }
}
function validate(argv) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield new validate_1.default().executeUnprofiled({ silent: true });
        }
        catch (_a) {
            log_1.log(chalk_1.default.red(`Cannot "restack --onto", git derrived stack must match meta defined stack. Consider running "restack" or "fix" first.`), argv);
            process.exit(1);
        }
    });
}
function restackOnto(currentBranch, onto, argv) {
    return __awaiter(this, void 0, void 0, function* () {
        // Check that the current branch has a parent to prevent moving main
        checkBranchCanBeMoved(currentBranch, argv);
        yield validate(argv);
        const parent = getParentForRebaseOnto(currentBranch, argv);
        child_process_1.execSync(`git rebase --onto ${onto} $(git merge-base ${currentBranch.name} ${parent.name}) ${currentBranch.name} -Xtheirs`, { stdio: "ignore" });
        // set current branch's parent only if the rebase succeeds.
        currentBranch.setParentBranchName(onto);
        // Now perform a restack starting from the onto branch:
        yield restackBranch(new branch_1.default(onto), onto, argv);
    });
}
function restackBranch(currentBranch, 
// Pass the ref to the branch head _before_ it was rebased
// We need this ref, because we can't find the child's merge base after the parent is rebased
// Because rebasing duplicates commits, so there wont be a shared commit anymore.
oldBranchHead, opts) {
    return __awaiter(this, void 0, void 0, function* () {
        const childBranches = yield currentBranch.getChildrenFromMeta();
        if (!childBranches) {
            log_1.log(chalk_1.default.yellow(`Cannot restack, found no child branches`), opts);
            process.exit(1);
        }
        for (const childBranch of childBranches) {
            const shaBeforeRebase = child_process_1.execSync(`git rev-parse ${childBranch.name}`)
                .toString()
                .trim();
            child_process_1.execSync(`git rebase --onto ${currentBranch.name} $(git merge-base ${childBranch.name} ${oldBranchHead}) ${childBranch.name} -Xtheirs`, { stdio: "ignore" });
            yield restackBranch(childBranch, shaBeforeRebase, opts);
        }
    });
}
exports.restackBranch = restackBranch;
//# sourceMappingURL=index.js.map