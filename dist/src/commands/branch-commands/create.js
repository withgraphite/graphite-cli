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
const create_branch_1 = require("../../actions/create_branch");
const telemetry_1 = require("../../lib/telemetry");
const args = {
    name: {
        type: 'string',
        positional: true,
        demandOption: false,
        optional: true,
        describe: 'The name of the new branch.',
    },
    'commit-message': {
        describe: `Commit staged changes on the new branch with this message.`,
        demandOption: false,
        type: 'string',
        alias: 'm',
    },
    'add-all': {
        describe: `Stage all un-staged changes on the new branch with this message.`,
        demandOption: false,
        default: false,
        type: 'boolean',
        alias: 'a',
    },
};
exports.aliases = ['c'];
exports.command = 'create [name]';
exports.canonical = 'branch create';
exports.description = 'Create a new branch stacked on top of the current branch and commit staged changes. If no branch name is specified but a commit message is passed, generate a branch name from the commit message.';
exports.builder = args;
const handler = (argv) => __awaiter(void 0, void 0, void 0, function* () {
    return telemetry_1.profile(argv, exports.canonical, (context) => __awaiter(void 0, void 0, void 0, function* () {
        yield create_branch_1.createBranchAction({
            branchName: argv.name,
            commitMessage: argv['commit-message'],
            addAll: argv['add-all'],
        }, context);
    }));
});
exports.handler = handler;
//# sourceMappingURL=create.js.map