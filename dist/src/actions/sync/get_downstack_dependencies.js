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
exports.getDownstackDependencies = void 0;
const graphite_cli_routes_1 = __importDefault(require("@withgraphite/graphite-cli-routes"));
const retyped_routes_1 = require("@withgraphite/retyped-routes");
const api_1 = require("../../lib/api");
const errors_1 = require("../../lib/errors");
const trunk_1 = require("../../lib/utils/trunk");
function getDownstackDependencies(branchName, context) {
    return __awaiter(this, void 0, void 0, function* () {
        const authToken = context.userConfig.data.authToken;
        if (!authToken) {
            throw new errors_1.ExitFailedError('You must authenticate with `gt auth` to sync.');
        }
        const org = context.repoConfig.getRepoOwner();
        const repo = context.repoConfig.getRepoName();
        const trunkName = trunk_1.getTrunk(context).name;
        const response = yield retyped_routes_1.request.requestWithArgs(api_1.API_SERVER, graphite_cli_routes_1.default.downstackDependencies, {}, {
            authToken,
            org,
            repo,
            trunkName,
            branchName,
        });
        if (response._response.status !== 200) {
            throw new errors_1.ExitFailedError(`Failed to get dependencies: ${response._response.body}`);
        }
        else if (response.downstackBranchNames &&
            response.downstackBranchNames.reverse().shift() !== trunk_1.getTrunk(context).name) {
            throw new errors_1.ExitFailedError(`Received invalid dependency response: ${response.downstackBranchNames}`);
        }
        return response.downstackBranchNames;
    });
}
exports.getDownstackDependencies = getDownstackDependencies;
//# sourceMappingURL=get_downstack_dependencies.js.map