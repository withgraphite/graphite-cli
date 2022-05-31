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
const checkout_branch_1 = require("../../lib/git/checkout_branch");
const preconditions_1 = require("../../lib/preconditions");
const profile_1 = require("../../lib/telemetry/profile");
const exec_sync_1 = require("../../lib/utils/exec_sync");
const trunk_1 = require("../../lib/utils/trunk");
const git_stack_builder_1 = require("../../wrapper-classes/git_stack_builder");
const args = {
    command: {
        describe: `The command you'd like to run on each branch of your stack.`,
        demandOption: true,
        type: 'string',
        alias: 'c',
        positional: true,
    },
    'skip-trunk': {
        describe: `Dont run the command on the trunk branch.`,
        demandOption: false,
        default: true,
        type: 'boolean',
    },
};
exports.command = 'test <command>';
exports.canonical = 'stack test';
exports.aliases = ['t'];
exports.description = 'Checkout each branch in your stack, run the provided command, and aggregate the results. Good finding bugs in your stack.';
exports.builder = args;
const handler = (argv) => __awaiter(void 0, void 0, void 0, function* () {
    return profile_1.profile(argv, exports.canonical, (context) => __awaiter(void 0, void 0, void 0, function* () {
        testStack(context, argv.command, { skipTrunk: argv['skip-trunk'] });
    }));
});
exports.handler = handler;
function testStack(context, command, opts) {
    const originalBranch = preconditions_1.currentBranchPrecondition(context);
    validateStack(context);
    context.splog.logInfo(chalk_1.default.grey(`Getting stack...`));
    const stack = new git_stack_builder_1.GitStackBuilder().fullStackFromBranch(originalBranch, context);
    context.splog.logInfo(chalk_1.default.grey(stack.toString() + '\n'));
    // Get branches to test.
    const branches = stack.branches().filter((b) => {
        if (opts.skipTrunk && b.name == trunk_1.getTrunk(context).name) {
            return false;
        }
        return true;
    });
    // Initialize state to print out.
    const state = {};
    branches.forEach((b) => {
        state[b.name] = { status: '[pending]', duration: undefined };
    });
    // Create a tmp output file for debugging.
    const tmpDir = tmp_1.default.dirSync();
    const outputPath = `${tmpDir.name}/output.txt`;
    fs_extra_1.default.writeFileSync(outputPath, '');
    context.splog.logInfo(chalk_1.default.grey(`Writing results to ${outputPath}\n`));
    // Kick off the testing.
    logState(state, false, context);
    branches.forEach((branch) => {
        testBranch({ command, branchName: branch.name, outputPath, state }, context);
    });
    // Finish off.
    checkout_branch_1.checkoutBranch(originalBranch.name, { quiet: true });
}
function testBranch(opts, context) {
    checkout_branch_1.checkoutBranch(opts.branchName, { quiet: true });
    // Mark the branch as running.
    opts.state[opts.branchName].status = '[running]';
    logState(opts.state, true, context);
    // Execute the command.
    const startTime = Date.now();
    fs_extra_1.default.appendFileSync(opts.outputPath, `\n\n${opts.branchName}\n`);
    const output = exec_sync_1.gpExecSync({ command: opts.command, options: { stdio: 'pipe' } }, () => {
        opts.state[opts.branchName].status = '[fail]';
    });
    fs_extra_1.default.appendFileSync(opts.outputPath, output);
    if (opts.state[opts.branchName].status !== '[fail]') {
        opts.state[opts.branchName].status = '[success]';
    }
    opts.state[opts.branchName].duration = Date.now() - startTime;
    // Write output to the output file.
    logState(opts.state, true, context);
}
function logState(state, refresh, context) {
    if (refresh) {
        process.stdout.moveCursor(0, -Object.keys(state).length);
    }
    Object.keys(state).forEach((branchName) => {
        const color = state[branchName].status === '[fail]'
            ? chalk_1.default.red
            : state[branchName].status === '[success]'
                ? chalk_1.default.green
                : state[branchName].status === '[running]'
                    ? chalk_1.default.cyan
                    : chalk_1.default.grey;
        const duration = state[branchName].duration;
        const durationString = duration
            ? new Date(duration).toISOString().split(/T/)[1].replace(/\..+/, '')
            : undefined;
        process.stdout.clearLine(0);
        // Example:
        // - [success]: tr--Track_CLI_and_Graphite_user_assoicat (00:00:22)
        context.splog.logInfo(`- ${color(state[branchName].status)}: ${branchName}${duration ? ` (${durationString})` : ''}`);
    });
}
function validateStack(context) {
    try {
        validate_1.validate('FULLSTACK', context);
    }
    catch (err) {
        throw new errors_1.ValidationFailedError(`Failed to validate fullstack before testing`);
    }
}
//# sourceMappingURL=test.js.map