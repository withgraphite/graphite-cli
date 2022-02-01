#!/usr/bin/env node
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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.syncPRInfoForBranches = void 0;
var retyped_routes_1 = require("@screenplaydev/retyped-routes");
var graphite_cli_routes_1 = require("graphite-cli-routes");
var utils_1 = require("../../lib/utils");
var branch_1 = require("../../wrapper-classes/branch");
var api_1 = require("../api");
var config_1 = require("../config");
/**
 * TODO (nicholasyan): for now, this just syncs info for branches with existing
 * PR info. In the future, we can extend this method to query GitHub for PRs
 * associated with branch heads that don't have associated PR info.
 */
function syncPRInfoForBranches(branches) {
    return __awaiter(this, void 0, void 0, function () {
        var authToken, repoName, repoOwner, response;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    authToken = config_1.userConfig.getAuthToken();
                    if (authToken === undefined) {
                        return [2 /*return*/];
                    }
                    repoName = config_1.repoConfig.getRepoName();
                    repoOwner = config_1.repoConfig.getRepoOwner();
                    return [4 /*yield*/, retyped_routes_1.request.requestWithArgs(api_1.API_SERVER, graphite_cli_routes_1["default"].pullRequestInfo, {
                            authToken: authToken,
                            repoName: repoName,
                            repoOwner: repoOwner,
                            prNumbers: [],
                            prHeadRefNames: branches
                                .filter(function (branch) { return !branch.isTrunk(); })
                                .map(function (branch) { return branch.name; })
                        })];
                case 1:
                    response = _a.sent();
                    if (!(response._response.status === 200)) return [3 /*break*/, 3];
                    // Note that this currently does not play nicely if the user has a branch
                    // that is being merged into multiple other branches; we expect this to
                    // be a rare case and will develop it lazily.
                    return [4 /*yield*/, Promise.all(response.prs.map(function (pr) { return __awaiter(_this, void 0, void 0, function () {
                            var branch;
                            var _a;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0: return [4 /*yield*/, branch_1["default"].branchWithName(pr.headRefName)];
                                    case 1:
                                        branch = _b.sent();
                                        branch.setPRInfo({
                                            number: pr.prNumber,
                                            base: pr.baseRefName,
                                            url: pr.url,
                                            state: pr.state,
                                            title: pr.title,
                                            reviewDecision: (_a = pr.reviewDecision) !== null && _a !== void 0 ? _a : undefined,
                                            isDraft: pr.isDraft
                                        });
                                        if (branch.name !== pr.headRefName) {
                                            utils_1.logError("PR " + pr.prNumber + " is associated with " + pr.headRefName + " on GitHub, but branch " + branch.name + " locally. Please rename the local branch (`gt branch rename`) to match the remote branch associated with the PR. (While " + branch.name + " is misaligned with GitHub, you cannot use `gt submit` on it.)");
                                        }
                                        return [2 /*return*/];
                                }
                            });
                        }); }))];
                case 2:
                    // Note that this currently does not play nicely if the user has a branch
                    // that is being merged into multiple other branches; we expect this to
                    // be a rare case and will develop it lazily.
                    _a.sent();
                    _a.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.syncPRInfoForBranches = syncPRInfoForBranches;
