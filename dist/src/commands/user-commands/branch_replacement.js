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
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.description = exports.canonical = exports.command = void 0;
const profile_1 = require("../../lib/telemetry/profile");
const branch_name_1 = require("../../lib/utils/branch_name");
const splog_1 = require("../../lib/utils/splog");
const args = {
    ['set-underscore']: {
        demandOption: false,
        optional: true,
        type: 'boolean',
        describe: 'Use underscore (_) as the replacement character',
    },
    ['set-dash']: {
        demandOption: false,
        optional: true,
        type: 'boolean',
        describe: 'Use dash (-) as the replacement character',
    },
    ['set-empty']: {
        demandOption: false,
        optional: true,
        type: 'boolean',
        describe: 'Remove invalid characters from the branch name without replacing them',
    },
};
exports.command = 'branch-replacement';
exports.canonical = 'user branch-replacement';
exports.description = 'Graphite only supports alphanumeric characters, underscores, and dashes in branch names.  Use this command to set what unsupported characters will be replaced with.';
exports.builder = args;
const handler = (argv) => __awaiter(void 0, void 0, void 0, function* () {
    return profile_1.profile(argv, exports.canonical, (context) => __awaiter(void 0, void 0, void 0, function* () {
        if (argv['set-underscore']) {
            context.userConfig.update((data) => (data.branchReplacement = '_'));
            splog_1.logInfo(`Set underscore (_) as the replacement character`);
        }
        else if (argv['set-dash']) {
            context.userConfig.update((data) => (data.branchReplacement = '-'));
            splog_1.logInfo(`Set dash (-) as the replacement character`);
        }
        else if (argv['set-empty']) {
            context.userConfig.update((data) => (data.branchReplacement = ''));
            splog_1.logInfo(`Invalid characters will be removed without being replaced`);
        }
        else {
            const replacement = branch_name_1.getBranchReplacement(context);
            splog_1.logInfo(`Invalid characters will be ${replacement === ''
                ? 'removed without being replaced'
                : `replaced with ${replacement}`}`);
        }
    }));
});
exports.handler = handler;
//# sourceMappingURL=branch_replacement.js.map