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
const child_process_1 = require("child_process");
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
    "from-commits": {
        describe: "The name of the target which builds your app for release",
        demandOption: false,
        type: "boolean",
        default: false,
    },
    fill: {
        describe: "Do not prompt for title/body and just use commit info",
        demandOption: false,
        type: "boolean",
        default: false,
        alias: "f",
    },
};
class SubmitCommand extends abstract_command_1.default {
    _execute(argv) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                child_process_1.execSync(`gh --version`);
            }
            catch (_b) {
                console.log(chalk_1.default.red(`Could not find bash tool 'gh', please install`));
                process.exit(1);
            }
            try {
                child_process_1.execSync(`gh auth status`);
            }
            catch (err) {
                console.log(chalk_1.default.red(`"gh auth status" indicates that you are not currently authed to GitHub`));
                process.exit(1);
            }
            try {
                yield new validate_1.default().executeUnprofiled({ silent: true });
            }
            catch (_c) {
                yield new print_stacks_1.default().executeUnprofiled(argv);
                throw new Error(`Validation failed before submitting.`);
            }
            let currentBranch = branch_1.default.getCurrentBranch();
            const stackOfBranches = [];
            while (currentBranch != undefined &&
                currentBranch.getParentFromMeta() != undefined // dont put up pr for a base branch like "main"
            ) {
                stackOfBranches.push(currentBranch);
                const parentBranchName = (_a = currentBranch.getParentFromMeta()) === null || _a === void 0 ? void 0 : _a.name;
                if (parentBranchName) {
                    currentBranch = yield branch_1.default.branchWithName(parentBranchName);
                }
                else {
                    currentBranch = undefined;
                }
            }
            // Create PR's for oldest branches first.
            stackOfBranches.reverse();
            stackOfBranches.forEach((branch, i) => {
                const parentBranch = i > 0 ? stackOfBranches[i - 1] : undefined;
                child_process_1.execSync([
                    `gh pr create`,
                    `--head ${branch.name}`,
                    ...(parentBranch ? [`--base ${parentBranch.name}`] : []),
                    ...(argv.fill ? [`-f`] : []),
                ].join(" "), { stdio: "inherit" });
            });
        });
    }
}
exports.default = SubmitCommand;
SubmitCommand.args = args;
//# sourceMappingURL=index.js.map