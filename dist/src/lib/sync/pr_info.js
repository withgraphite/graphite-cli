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
exports.syncPRInfoForBranches = void 0;
const graphite_cli_routes_1 = __importDefault(require("@withgraphite/graphite-cli-routes"));
const retyped_routes_1 = require("@withgraphite/retyped-routes");
const utils_1 = require("../../lib/utils");
const branch_1 = require("../../wrapper-classes/branch");
const api_1 = require("../api");
/**
 * TODO (nicholasyan): for now, this just syncs info for branches with existing
 * PR info. In the future, we can extend this method to query GitHub for PRs
 * associated with branch heads that don't have associated PR info.
 */
function syncPRInfoForBranches(branches, context) {
    return __awaiter(this, void 0, void 0, function* () {
        const authToken = context.userConfig.data.authToken;
        if (authToken === undefined) {
            return;
        }
        const repoName = context.repoConfig.getRepoName();
        const repoOwner = context.repoConfig.getRepoOwner();
        const response = yield retyped_routes_1.request.requestWithArgs(api_1.API_SERVER, graphite_cli_routes_1.default.pullRequestInfo, {
            authToken: authToken,
            repoName: repoName,
            repoOwner: repoOwner,
            prNumbers: [],
            prHeadRefNames: branches
                .filter((branch) => !branch.isTrunk(context))
                .map((branch) => branch.name),
        });
        if (response._response.status === 200) {
            // Note that this currently does not play nicely if the user has a branch
            // that is being merged into multiple other branches; we expect this to
            // be a rare case and will develop it lazily.
            yield Promise.all(response.prs.map((pr) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                const branch = yield branch_1.Branch.branchWithName(pr.headRefName, context);
                branch.setPRInfo({
                    number: pr.prNumber,
                    base: pr.baseRefName,
                    url: pr.url,
                    state: pr.state,
                    title: pr.title,
                    reviewDecision: (_a = pr.reviewDecision) !== null && _a !== void 0 ? _a : undefined,
                    isDraft: pr.isDraft,
                });
                if (branch.name !== pr.headRefName) {
                    utils_1.logError(`PR ${pr.prNumber} is associated with ${pr.headRefName} on GitHub, but branch ${branch.name} locally. Please rename the local branch (\`gt branch rename\`) to match the remote branch associated with the PR. (While ${branch.name} is misaligned with GitHub, you cannot use \`gt submit\` on it.)`);
                }
            })));
        }
    });
}
exports.syncPRInfoForBranches = syncPRInfoForBranches;
//# sourceMappingURL=pr_info.js.map