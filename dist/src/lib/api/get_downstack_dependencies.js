"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDownstackDependencies = void 0;
const graphite_cli_routes_1 = __importDefault(require("@withgraphite/graphite-cli-routes"));
const retyped_routes_1 = require("@withgraphite/retyped-routes");
const errors_1 = require("../errors");
const server_1 = require("./server");
async function getDownstackDependencies(args, params) {
    const response = await retyped_routes_1.request.requestWithArgs(server_1.API_SERVER, graphite_cli_routes_1.default.downstackDependencies, {}, {
        authToken: params.authToken,
        org: params.repoOwner,
        repo: params.repoName,
        trunkName: args.trunkName,
        branchName: args.branchName,
    });
    if (response._response.status !== 200) {
        throw new errors_1.ExitFailedError(`Failed to get dependencies: ${response._response.body}`);
    }
    // We want to validate that the top branch is the one we asked for and
    // that the bottom is trunk.
    const topReturnedBranch = response.downstackBranchNames[0];
    // We remove trunk from the list (it doesn't need any action)
    // We reverse the list in place so that we can merge from the bottom up
    const bottomReturnedBranch = response.downstackBranchNames.reverse().shift();
    if (topReturnedBranch !== args.branchName ||
        bottomReturnedBranch !== args.trunkName) {
        throw new errors_1.ExitFailedError(`Received invalid dependency response: ${response.downstackBranchNames}`);
    }
    return response.downstackBranchNames;
}
exports.getDownstackDependencies = getDownstackDependencies;
//# sourceMappingURL=get_downstack_dependencies.js.map