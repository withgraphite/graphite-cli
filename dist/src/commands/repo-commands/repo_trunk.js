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
const chalk_1 = __importDefault(require("chalk"));
const config_1 = require("../../lib/config");
const preconditions_1 = require("../../lib/preconditions");
const telemetry_1 = require("../../lib/telemetry");
const utils_1 = require("../../lib/utils");
const args = {
    set: {
        demandOption: false,
        default: false,
        type: 'string',
        alias: 's',
        describe: "Override the value of the repo's trunk branch in the Graphite config.",
    },
};
exports.command = 'trunk';
exports.canonical = 'repo trunk';
exports.description = 'The trunk branch of the current repo. Graphite uses the trunk branch as the base of all stacks.';
exports.builder = args;
const handler = (argv) => __awaiter(void 0, void 0, void 0, function* () {
    return telemetry_1.profile(argv, exports.canonical, () => __awaiter(void 0, void 0, void 0, function* () {
        if (argv.set) {
            preconditions_1.branchExistsPrecondition(argv.set);
            config_1.repoConfig.setTrunk(argv.set);
        }
        else {
            console.log(`(${chalk_1.default.green(utils_1.getTrunk())})`);
        }
    }));
});
exports.handler = handler;
//# sourceMappingURL=repo_trunk.js.map