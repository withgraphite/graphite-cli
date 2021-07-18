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
const chalk_1 = __importDefault(require("chalk"));
const log_1 = require("../../lib/log");
const branch_1 = __importDefault(require("../../wrapper-classes/branch"));
const abstract_command_1 = __importDefault(require("../abstract_command"));
const args = {
    silent: {
        describe: `silence output from the command`,
        demandOption: false,
        default: false,
        type: "boolean",
        alias: "s",
    },
};
class FixCommand extends abstract_command_1.default {
    _execute(argv) {
        return __awaiter(this, void 0, void 0, function* () {
            const branch = branch_1.default.getCurrentBranch();
            printBranchNameStack(`(Original  git derived stack)`, branch.stackByTracingGitParents(), argv);
            printBranchNameStack(`(Original meta derived stack)`, branch.stackByTracingMetaParents(), argv);
            // Walk the current branch down to the base and create stacks.
            yield recursiveFix(branch, argv);
            printBranchNameStack(`(New meta stack)`, branch.stackByTracingMetaParents(), argv);
        });
    }
}
exports.default = FixCommand;
FixCommand.args = args;
function printBranchNameStack(message, names, opts) {
    log_1.log(`[${names.map((name) => `(${chalk_1.default.green(name)})`).join("->")}] ${message}`, opts);
}
function recursiveFix(branch, opts) {
    return __awaiter(this, void 0, void 0, function* () {
        const gitParents = branch.getParentsFromGit();
        // Check if we're at a base branch
        if (gitParents.length === 0) {
            log_1.log(`-> (${branch.name}) has no git parent branches and so is considered to be the base`, opts);
            return;
        }
        const metaParent = branch.getParentFromMeta();
        if (metaParent &&
            gitParents.some((gitParent) => gitParent.name == metaParent.name)) {
            log_1.log(`-> (${branch.name}) has matching meta and git parent branch (${metaParent.name}), no update`, opts);
            yield recursiveFix(metaParent, opts);
        }
        else if (gitParents.length === 1) {
            if (metaParent) {
                log_1.log(`-> (${branch.name}) has meta parent branch (${metaParent.name}) but git parent branch (${gitParents[0].name}), ${chalk_1.default.green("updating")}`, opts);
            }
            else {
                log_1.log(`-> (${branch.name}) has no meta parent branch but git parent branch (${gitParents[0].name}), ${chalk_1.default.green("updating")}`, opts);
            }
            branch.setParentBranchName(gitParents[0].name);
            yield recursiveFix(gitParents[0], opts);
        }
        else if (metaParent && gitParents.length > 1) {
            log_1.log(`-> (${branch.name}) has meta parent branch (${metaParent.name}) but multiple git parent branches [${gitParents
                .map((b) => `(${b.name})`)
                .join(", ")}]. ${chalk_1.default.red("Cannot continue")}`, opts);
            process.exit(1);
        }
        else if (!metaParent && gitParents.length > 1) {
            log_1.log(`-> (${branch.name}) has no meta parent branch but multiple git parent branches [${gitParents
                .map((b) => `(${b.name})`)
                .join(", ")}].  ${chalk_1.default.red("Cannot continue")}`, opts);
            process.exit(1);
        }
        else {
            log_1.log(chalk_1.default.yellow(`Error: No fix patern detected for git: ${gitParents}, meta: ${metaParent}, exiting`), opts);
            process.exit(1);
        }
    });
}
//# sourceMappingURL=index.js.map