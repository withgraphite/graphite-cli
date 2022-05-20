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
const profile_1 = require("../../lib/telemetry/profile");
const branch_name_1 = require("../../lib/utils/branch_name");
const splog_1 = require("../../lib/utils/splog");
const args = {
    set: {
        demandOption: false,
        optional: true,
        type: 'string',
        alias: 's',
        describe: 'Set a new prefix for branch names.',
    },
    reset: {
        demandOption: false,
        optional: true,
        type: 'boolean',
        alias: 'r',
        describe: 'Turn off branch prefixing. Takes precendence over --set',
    },
};
exports.command = 'branch-prefix';
exports.canonical = 'user branch-prefix';
exports.description = "The prefix which Graphite will prepend to all auto-generated branch names (i.e. when you don't specify a branch name when calling `gt branch create`).";
exports.builder = args;
const handler = (argv) => __awaiter(void 0, void 0, void 0, function* () {
    return profile_1.profile(argv, exports.canonical, (context) => __awaiter(void 0, void 0, void 0, function* () {
        if (argv.reset) {
            splog_1.logInfo(`Reset branch-prefix`);
            branch_name_1.setBranchPrefix('', context);
        }
        else if (argv.set) {
            splog_1.logInfo(`Set branch-prefix to "${chalk_1.default.green(branch_name_1.setBranchPrefix(argv.set, context))}"`);
        }
        else {
            splog_1.logInfo(context.userConfig.data.branchPrefix ||
                'branch-prefix is not set. Try running `gt user branch-prefix --set <prefix>` to update the value.');
        }
    }));
});
exports.handler = handler;
//# sourceMappingURL=branch_prefix.js.map