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
    enable: {
        demandOption: false,
        optional: true,
        type: 'boolean',
        describe: 'Enable date in auto-generated branch names',
    },
    disable: {
        demandOption: false,
        optional: true,
        type: 'boolean',
        describe: 'Disable date in auto-generated branch names',
    },
};
exports.command = 'branch-date';
exports.canonical = 'user branch-date';
exports.description = "Toggle prepending date to auto-generated branch names (i.e. when you don't specify a branch name when calling `gt branch create`).";
exports.builder = args;
const handler = (argv) => __awaiter(void 0, void 0, void 0, function* () {
    return profile_1.profile(argv, exports.canonical, (context) => __awaiter(void 0, void 0, void 0, function* () {
        if (argv.enable) {
            context.userConfig.update((data) => (data.branchDate = true));
            splog_1.logInfo(`Enabled date`);
        }
        else if (argv.disable) {
            context.userConfig.update((data) => (data.branchDate = false));
            splog_1.logInfo(`Disabled date`);
        }
        else {
            splog_1.logInfo(`Branch date is ${branch_name_1.getBranchDateEnabled(context) ? 'enabled' : 'disabled'}`);
        }
    }));
});
exports.handler = handler;
//# sourceMappingURL=branch_date.js.map