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
exports.handler = exports.builder = exports.description = exports.canonical = exports.command = exports.aliases = void 0;
const delete_branch_1 = require("../../actions/delete_branch");
const telemetry_1 = require("../../lib/telemetry");
const args = {
    name: {
        type: 'string',
        positional: true,
        demandOption: true,
        optional: false,
        describe: 'The name of the branch to delete.',
    },
    force: {
        describe: `Force delete the git branch.`,
        demandOption: false,
        type: 'boolean',
        alias: 'D',
        default: false,
    },
};
exports.aliases = ['d'];
exports.command = 'delete [name]';
exports.canonical = 'branch delete';
exports.description = 'Delete a given git branch and its corresponding Graphite metadata.';
exports.builder = args;
const handler = (argv) => __awaiter(void 0, void 0, void 0, function* () {
    return telemetry_1.profile(argv, exports.canonical, () => __awaiter(void 0, void 0, void 0, function* () {
        yield delete_branch_1.deleteBranchAction({
            branchName: argv.name,
            force: argv.force,
        });
    }));
});
exports.handler = handler;
//# sourceMappingURL=delete.js.map