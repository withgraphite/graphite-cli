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
exports.handler = exports.builder = exports.description = exports.canonical = exports.command = void 0;
const config_1 = require("../../lib/config");
const errors_1 = require("../../lib/errors");
const telemetry_1 = require("../../lib/telemetry");
const utils_1 = require("../../lib/utils");
const branch_1 = __importDefault(require("../../wrapper-classes/branch"));
const args = {
    add: {
        demandOption: false,
        default: false,
        type: "string",
        describe: "Add a branch to be ignored by Graphite.",
    },
};
exports.command = "ignored-branches";
exports.canonical = "repo ignore-branches";
exports.description = "Specify branches for Graphite to ignore. Often branches that you never plan to create PRs and merge into trunk.";
exports.builder = args;
const handler = (argv) => __awaiter(void 0, void 0, void 0, function* () {
    return telemetry_1.profile(argv, exports.canonical, () => __awaiter(void 0, void 0, void 0, function* () {
        if (argv.add) {
            if (!branch_1.default.exists(argv.add)) {
                throw new errors_1.PreconditionsFailedError(`Branch (${argv.add}) not found`);
            }
            config_1.repoConfig.setIgnoreBranches(config_1.repoConfig.getIgnoreBranches().concat([argv.add]));
            utils_1.logInfo(`Added (${argv.add}) to be ignored`);
        }
        else {
            utils_1.logInfo(config_1.repoConfig.getIgnoreBranches().join("\n"));
        }
    }));
});
exports.handler = handler;
//# sourceMappingURL=ignored_branches.js.map