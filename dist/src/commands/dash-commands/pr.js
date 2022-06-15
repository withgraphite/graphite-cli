"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.aliases = exports.canonical = exports.builder = exports.description = exports.command = void 0;
const open_1 = __importDefault(require("open"));
const runner_1 = require("../../lib/runner");
const args = {
    pr: {
        describe: `An PR number or branch name to open.`,
        demandOption: false,
        positional: true,
        type: 'string',
    },
};
exports.command = 'pr [pr]';
exports.description = 'Opens the PR page for the current branch.';
exports.builder = args;
exports.canonical = 'dash pr';
exports.aliases = ['p'];
const DASHBOARD_URL = 'https://app.graphite.dev/';
const PR_PATH = DASHBOARD_URL + 'github/pr/';
const handler = async (argv) => (0, runner_1.graphite)(argv, exports.canonical, async (context) => {
    const prNumber = parseInt(argv.pr || '');
    if (prNumber) {
        return void (0, open_1.default)(`${PR_PATH}${context.repoConfig.getRepoOwner()}/${context.repoConfig.getRepoName()}/${prNumber}`);
    }
    const branchName = argv.pr ? argv.pr : context.metaCache.currentBranch;
    const branchPrNumber = branchName && context.metaCache.branchExists(branchName)
        ? context.metaCache.getPrInfo(branchName)?.number
        : undefined;
    if (branchPrNumber) {
        return void (0, open_1.default)(`${PR_PATH}${context.repoConfig.getRepoOwner()}/${context.repoConfig.getRepoName()}/${branchPrNumber}`);
    }
    return void (0, open_1.default)(DASHBOARD_URL);
});
exports.handler = handler;
//# sourceMappingURL=pr.js.map