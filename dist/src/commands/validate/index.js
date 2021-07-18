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
class ValidateCommand extends abstract_command_1.default {
    _execute(argv) {
        return __awaiter(this, void 0, void 0, function* () {
            const baseBranch = branch_1.default.getCurrentBranch().getTrunkBranchFromGit();
            yield validateBranch(baseBranch, argv);
            log_1.log(`Current stack is valid`, argv);
        });
    }
}
exports.default = ValidateCommand;
ValidateCommand.args = args;
function validateBranch(branch, opts) {
    return __awaiter(this, void 0, void 0, function* () {
        const metaChildren = yield branch.getChildrenFromMeta();
        const gitChildren = branch.getChildrenFromGit();
        const hasGitChildren = gitChildren && gitChildren.length > 0;
        const hasMetaChildren = metaChildren.length > 0;
        if (hasGitChildren && !hasMetaChildren) {
            throw new Error(`${branch.name} missing a child in sd's meta graph`);
        }
        if (!hasGitChildren && hasMetaChildren) {
            throw new Error(`Unable to find child branches in git for ${branch.name}`);
        }
        if (!hasGitChildren && !hasMetaChildren) {
            // Assume to be a trunk branch and implicately valid.
            log_1.log(`✅ ${chalk_1.default.green(`(${branch.name}) validated`)}`, opts);
            return;
        }
        const gitChildrenMissingInMeta = gitChildren.filter((gitChild) => !metaChildren.map((b) => b.name).includes(gitChild.name));
        if (gitChildrenMissingInMeta.length > 0) {
            throw new Error(`Child branches [${gitChildrenMissingInMeta
                .map((b) => `(${b.name})`)
                .join(", ")}] not found in sd's meta graph.`);
        }
        log_1.log(`✅ ${chalk_1.default.green(`(${branch.name}) validated`)}`, opts);
        for (const child of metaChildren) {
            yield validateBranch(child, opts);
        }
    });
}
//# sourceMappingURL=index.js.map