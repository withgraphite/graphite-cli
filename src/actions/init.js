"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.init = void 0;
var chalk_1 = require("chalk");
var fs_extra_1 = require("fs-extra");
var prompts_1 = require("prompts");
var config_1 = require("../lib/config");
var errors_1 = require("../lib/errors");
var preconditions_1 = require("../lib/preconditions");
var utils_1 = require("../lib/utils");
var trunk_1 = require("../lib/utils/trunk");
var branch_1 = require("../wrapper-classes/branch");
function init(trunk, ignoreBranches) {
    return __awaiter(this, void 0, void 0, function () {
        var allBranches, newTrunkName, ignoreBranches_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    preconditions_1.currentGitRepoPrecondition();
                    allBranches = branch_1["default"].allBranches();
                    logWelcomeMessage();
                    utils_1.logNewline();
                    /**
                     * When a branch new repo is created, it technically has 0 branches as a
                     * branch doesn't become 'born' until it has a commit on it. In this case,
                     * we exit early from init - which will continue to run and short-circuit
                     * until the repo has a proper commit.
                     *
                     * https://newbedev.com/git-branch-not-returning-any-results
                     */
                    if (allBranches.length === 0) {
                        utils_1.logError("Ouch! We can't setup Graphite in a repo without any branches -- this is likely because you're initializing Graphite in a blank repo. Please create your first commit and then re-run your Graphite command.");
                        utils_1.logNewline();
                        throw new errors_1.PreconditionsFailedError("No branches found in current repo; cannot initialize Graphite.");
                    }
                    if (!trunk) return [3 /*break*/, 1];
                    if (branch_1["default"].exists(trunk)) {
                        newTrunkName = trunk;
                        config_1.repoConfig.setTrunk(newTrunkName);
                        utils_1.logInfo("Trunk set to (" + newTrunkName + ")");
                    }
                    else {
                        throw new errors_1.PreconditionsFailedError("Cannot set (" + trunk + ") as trunk, branch not found in current repo.");
                    }
                    return [3 /*break*/, 3];
                case 1: return [4 /*yield*/, selectTrunkBranch(allBranches)];
                case 2:
                    newTrunkName = _a.sent();
                    config_1.repoConfig.setTrunk(newTrunkName);
                    _a.label = 3;
                case 3:
                    if (!ignoreBranches) return [3 /*break*/, 4];
                    ignoreBranches.forEach(function (branchName) {
                        if (!branch_1["default"].exists(branchName)) {
                            throw new errors_1.PreconditionsFailedError("Cannot set (" + branchName + ") to be ignore, branch not found in current repo.");
                        }
                    });
                    config_1.repoConfig.addIgnoreBranchPatterns(ignoreBranches);
                    return [3 /*break*/, 6];
                case 4: return [4 /*yield*/, selectIgnoreBranches(allBranches, newTrunkName)];
                case 5:
                    ignoreBranches_1 = _a.sent();
                    utils_1.logInfo("Selected following branches to ignore: " + ignoreBranches_1);
                    if (!ignoreBranches_1) {
                        ignoreBranches_1 = [];
                    }
                    config_1.repoConfig.addIgnoreBranchPatterns(ignoreBranches_1);
                    _a.label = 6;
                case 6:
                    utils_1.logInfo("Graphite repo config saved at \"" + config_1.repoConfig.path() + "\"");
                    utils_1.logInfo(fs_extra_1["default"].readFileSync(config_1.repoConfig.path()).toString());
                    return [2 /*return*/];
            }
        });
    });
}
exports.init = init;
function logWelcomeMessage() {
    if (!config_1.repoConfig.graphiteInitialized()) {
        utils_1.logInfo('Welcome to Graphite!');
    }
    else {
        utils_1.logInfo("Regenerating Graphite repo config (" + config_1.repoConfig.path() + ")");
    }
}
function selectIgnoreBranches(allBranches, trunk) {
    return __awaiter(this, void 0, void 0, function () {
        var branchesWithoutTrunk, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    branchesWithoutTrunk = allBranches.filter(function (b) { return b.name != trunk; });
                    if (branchesWithoutTrunk.length === 0) {
                        return [2 /*return*/, []];
                    }
                    return [4 /*yield*/, prompts_1["default"]({
                            type: 'multiselect',
                            name: 'branches',
                            message: "Ignore Branches: select any permanent branches never to be stacked (such as \"prod\" or \"staging\"). " + chalk_1["default"].yellow('Fine to select none.'),
                            choices: branchesWithoutTrunk.map(function (b) {
                                return { title: b.name, value: b.name };
                            })
                        })];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.branches];
            }
        });
    });
}
function selectTrunkBranch(allBranches) {
    return __awaiter(this, void 0, void 0, function () {
        var trunk, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    trunk = trunk_1.inferTrunk();
                    return [4 /*yield*/, prompts_1["default"](__assign({ type: 'autocomplete', name: 'branch', message: "Select a trunk branch, which you open pull requests against" + (trunk ? " [inferred trunk (" + chalk_1["default"].green(trunk.name) + ")]" : ''), choices: allBranches.map(function (b) {
                                return { title: b.name, value: b.name };
                            }) }, (trunk ? { initial: trunk.name } : {})))];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.branch];
            }
        });
    });
}
