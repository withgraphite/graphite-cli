"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testStack = void 0;
const chalk_1 = __importDefault(require("chalk"));
const child_process_1 = __importDefault(require("child_process"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const tmp_1 = __importDefault(require("tmp"));
const scope_spec_1 = require("../lib/engine/scope_spec");
function testStack(opts, context) {
    const currentBranch = context.metaCache.currentBranchPrecondition;
    // Get branches to test.
    const branches = context.metaCache
        .getRelativeStack(currentBranch, scope_spec_1.SCOPE.STACK)
        .filter((branch) => opts.includeTrunk || !context.metaCache.isTrunk(branch));
    // Initialize state to print out.
    const state = {};
    branches.forEach((b) => {
        state[b] = { status: '[pending]', duration: undefined, outfile: undefined };
    });
    // Create a tmp output directory for debugging.
    const tmpDirName = tmp_1.default.dirSync().name;
    // Kick off the testing.
    logState(state, false, context);
    branches.forEach((branchName) => testBranch({ command: opts.command, branchName, tmpDirName, state }, context));
    context.splog.info(`Output files: ${chalk_1.default.gray(`/var/folders/gg/xctw127s4hs8gzlcdtghgzdr0000gn/T/tmp-31480-L1GLB4ngiQkT/`)}`);
    // Finish off.
    context.metaCache.checkoutBranch(currentBranch);
}
exports.testStack = testStack;
function testBranch(opts, context) {
    context.metaCache.checkoutBranch(opts.branchName);
    const outputPath = path_1.default.join(opts.tmpDirName, opts.branchName);
    // Mark the branch as running.
    opts.state[opts.branchName].status = '[running]';
    logState(opts.state, true, context);
    const startTime = Date.now();
    try {
        const out = child_process_1.default.execSync(opts.command, { encoding: 'utf-8' });
        fs_extra_1.default.writeFileSync(outputPath, out);
        opts.state[opts.branchName].status = '[success]';
    }
    catch (e) {
        if (e?.signal) {
            fs_extra_1.default.writeFileSync(outputPath, [e.stdout, e.stderr, e.signal].join('\n'));
            opts.state[opts.branchName].status = '[killed]';
        }
        else if (e?.status) {
            fs_extra_1.default.writeFileSync(outputPath, [e.stdout, e.stderr, e.status].join('\n'));
            opts.state[opts.branchName].status = '[failed]';
        }
        else {
            throw e;
        }
    }
    opts.state[opts.branchName].duration = Date.now() - startTime;
    opts.state[opts.branchName].outfile = outputPath;
    // Write output to the output file.
    logState(opts.state, true, context);
}
function logState(state, refresh, context) {
    if (refresh) {
        process.stdout.moveCursor(0, -Object.keys(state).length);
    }
    Object.keys(state).forEach((branchName) => {
        const color = state[branchName].status === '[failed]' ||
            state[branchName].status === '[killed]'
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