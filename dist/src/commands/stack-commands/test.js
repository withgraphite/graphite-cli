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
exports.handler = exports.builder = exports.description = exports.aliases = exports.canonical = exports.command = void 0;
const chalk_1 = __importDefault(require("chalk"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const tmp_1 = __importDefault(require("tmp"));
const validate_1 = require("../../actions/validate");
const errors_1 = require("../../lib/errors");
const preconditions_1 = require("../../lib/preconditions");
const telemetry_1 = require("../../lib/telemetry");
const utils_1 = require("../../lib/utils");
const wrapper_classes_1 = require("../../wrapper-classes");
const args = {
    command: {
        describe: `The command you'd like to run on each branch of your stack.`,
        demandOption: true,
        type: "string",
        alias: "c",
        positional: true,
    },
    "skip-trunk": {
        describe: `Dont run the command on the trunk branch.`,
        demandOption: false,
        default: true,
        type: "boolean",
    },
};
exports.command = "test <command>";
exports.canonical = "stack test";
exports.aliases = ["t"];
exports.description = "Checkout each branch in your stack, run the provided command, and aggregate the results. Good finding bugs in your stack.";
exports.builder = args;
const handler = (argv) => __awaiter(void 0, void 0, void 0, function* () {
    return telemetry_1.profile(argv, exports.canonical, () => __awaiter(void 0, void 0, void 0, function* () {
        testStack(argv.command, { skipTrunk: argv["skip-trunk"] });
    }));
});
exports.handler = handler;
function testStack(command, opts) {
    const originalBranch = preconditions_1.currentBranchPrecondition();
    validateStack();
    utils_1.logInfo(chalk_1.default.grey(`Getting stack...`));
    const stack = new wrapper_classes_1.GitStackBuilder().fullStackFromBranch(originalBranch);
    utils_1.logInfo(chalk_1.default.grey(stack.toString() + "\n"));
    // Get branches to test.
    const branches = stack.branches().filter((b) => {
        if (opts.skipTrunk && b.name == utils_1.getTrunk().name) {
            return false;
        }
        return true;
    });
    // Initialize state to print out.
    const state = {};
    branches.forEach((b) => {
        state[b.name] = { status: "[pending]", duration: undefined };
    });
    // Create a tmp output file for debugging.
    const tmpDir = tmp_1.default.dirSync();
    const outputPath = `${tmpDir.name}/output.txt`;
    fs_extra_1.default.writeFileSync(outputPath, "");
    utils_1.logInfo(chalk_1.default.grey(`Writing results to ${outputPath}\n`));
    // Kick off the testing.
    logState(state, false);
    branches.forEach((branch) => {
        testBranch({ command, branchName: branch.name, outputPath, state });
    });
    // Finish off.
    utils_1.checkoutBranch(originalBranch.name);
}
function testBranch(opts) {
    utils_1.checkoutBranch(opts.branchName);
    // Mark the branch as running.
    opts.state[opts.branchName].status = "[running]";
    logState(opts.state, true);
    // Execute the command.
    const startTime = Date.now();
    fs_extra_1.default.appendFileSync(opts.outputPath, `\n\n${opts.branchName}\n`);
    const output = utils_1.gpExecSync({ command: opts.command, options: { stdio: "pipe" } }, () => {
        opts.state[opts.branchName].status = "[fail]";
    }).toString();
    fs_extra_1.default.appendFileSync(opts.outputPath, output);
    if (opts.state[opts.branchName].status !== "[fail]") {
        opts.state[opts.branchName].status = "[success]";
    }
    opts.state[opts.branchName].duration = Date.now() - startTime;
    // Write output to the output file.
    logState(opts.state, true);
}
function logState(state, refresh) {
    if (refresh) {
        process.stdout.moveCursor(0, -Object.keys(state).length);
    }
    Object.keys(state).forEach((branchName) => {
        const color = state[branchName].status === "[fail]"
            ? chalk_1.default.red
            : state[branchName].status === "[success]"
                ? chalk_1.default.green
                : state[branchName].status === "[running]"
                    ? chalk_1.default.cyan
                    : chalk_1.default.grey;
        const duration = state[branchName].duration
            ? new Date(state[branchName].duration)
                .toISOString()
                .split(/T/)[1]
                .replace(/\..+/, "")
            : undefined;
        process.stdout.clearLine(0);
        // Example:
        // - [success]: tr--Track_CLI_and_Graphite_user_assoicat (00:00:22)
        utils_1.logInfo(`- ${color(state[branchName].status)}: ${branchName}${duration ? ` (${duration})` : ""}`);
    });
}
function validateStack() {
    try {
        validate_1.validate("FULLSTACK");
    }
    catch (err) {
        throw new errors_1.ValidationFailedError(`Failed to validate fullstack before testing`);
    }
}
//# sourceMappingURL=test.js.map