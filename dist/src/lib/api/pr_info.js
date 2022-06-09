"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPrInfoForBranches = void 0;
const graphite_cli_routes_1 = __importDefault(require("@withgraphite/graphite-cli-routes"));
const retyped_routes_1 = require("@withgraphite/retyped-routes");
const server_1 = require("./server");
async function getPrInfoForBranches(branchNamesWithExistingPrInfo, params) {
    // We sync branches without existing PR info by name.  For branches
    // that are already associated with a PR, we only sync if both the
    // the associated PR (keyed by number) if the name matches the headRef.
    const branchesWithoutPrInfo = new Set();
    const existingPrInfo = new Map();
    branchNamesWithExistingPrInfo.forEach((branch) => {
        if (branch?.prNumber === undefined) {
            branchesWithoutPrInfo.add(branch.branchName);
        }
        else {
            existingPrInfo.set(branch.prNumber, branch.branchName);
        }
    });
    const response = await retyped_routes_1.request.requestWithArgs(server_1.API_SERVER, graphite_cli_routes_1.default.pullRequestInfo, {
        ...params,
        prNumbers: [...existingPrInfo.keys()],
        prHeadRefNames: [...branchesWithoutPrInfo],
    });
    if (response._response.status !== 200) {
        return [];
    }
    return response.prs.filter((pr) => {
        const branchNameIfAssociated = existingPrInfo.get(pr.prNumber);
        const shouldAssociatePrWithBranch = !branchNameIfAssociated &&
            pr.state === 'OPEN' &&
            branchesWithoutPrInfo.has(pr.headRefName);
        const shouldUpdateExistingBranch = branchNameIfAssociated === pr.headRefName;
        return shouldAssociatePrWithBranch || shouldUpdateExistingBranch;
    });
}
exports.getPrInfoForBranches = getPrInfoForBranches;
//# sourceMappingURL=pr_info.js.map