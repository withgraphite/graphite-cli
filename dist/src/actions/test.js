"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testStack = void 0;
const chalk_1 = __importDefault(require("chalk"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const tmp_1 = __importDefault(require("tmp"));
const scope_spec_1 = require("../lib/engine/scope_spec");
const exec_sync_1 = require("../lib/utils/exec_sync");
function testStack(opts, context) {
    const currentBranch = context.metaCache.currentBranchPrecondition;
    // Get branches to test.
    const branches = context.metaCache
        .getRelativeStack(currentBranch, scope_spec_1.SCOPE.STACK)
        .filter((branch) => opts.includeTrunk || !context.metaCache.isTrunk(branch));
    // Initialize state to print out.
    const state = {};
    branches.forEach((b) => {
        state[b] = { status: '[pending]', duration: undefined };
    });
    // Create a tmp output file for debugging.
    const tmpDir = tmp_1.default.dirSync();
    const outputPath = `${tmpDir.name}/output.txt`;
    fs_extra_1.default.writeFileSync(outputPath, '');
    context.splog.info(chalk_1.default.grey(`Writing results to ${outputPath}\n`));
    // Kick off the testing.
    logState(state, false, context);
    branches.forEach((branchName) => testBranch({ command: opts.command, branchName, outputPath, state }, context));
    // Finish off.
    context.metaCache.checkoutBranch(currentBranch);
}
exports.testStack = testStack;
function testBranch(opts, context) {
    context.metaCache.checkoutBranch(opts.branchName);
    // Mark the branch as running.
    opts.state[opts.branchName].status = '[running]';
    logState(opts.state, true, context);
    // Execute the command.
    fs_extra_1.default.appendFileSync(opts.outputPath, `\n\n${opts.branchName}\n`);
    const startTime = Date.now();
    const output = (0, exec_sync_1.gpExecSync)({ command: `${opts.command} 2>&1` }, () => {
        opts.state[opts.branchName].status = '[fail]';
    });
    opts.state[opts.branchName].duration = Date.now() - startTime;
    fs_extra_1.default.appendFileSync(opts.outputPath, output);
    if (opts.state[opts.branchName].status !== '[fail]') {
        opts.state[opts.branchName].status = '[success]';
    }
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
        context.splog.info(`- ${color(state[branchName].status)}: ${branchName}${duration ? ` (${durationString})` : ''}`);
    });
}
//# sourceMappingURL=test.js.map