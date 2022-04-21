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
const cache_1 = require("../../lib/config/cache");
const errors_1 = require("../../lib/errors");
const preconditions_1 = require("../../lib/preconditions");
const telemetry_1 = require("../../lib/telemetry");
const utils_1 = require("../../lib/utils");
const wrapper_classes_1 = require("../../wrapper-classes");
const branch_1 = require("../../wrapper-classes/branch");
const args = {
    'new-branch-name': {
        describe: `The new name for the current branch`,
        demandOption: true,
        type: 'string',
        positional: true,
    },
};
exports.command = 'rename <new-branch-name>';
exports.canonical = 'branch rename';
exports.description = 'Rename a branch and update metadata referencing it.';
exports.builder = args;
const handler = (args) => __awaiter(void 0, void 0, void 0, function* () {
    return telemetry_1.profile(args, exports.canonical, (context) => __awaiter(void 0, void 0, void 0, function* () {
        const currentBranch = preconditions_1.currentBranchPrecondition(context);
        const oldName = currentBranch.name;
        const newName = args['new-branch-name'];
        const allBranches = branch_1.Branch.allBranches(context);
        utils_1.gpExecSync({ command: `git branch -m ${newName}` }, (err) => {
            throw new errors_1.ExitFailedError(`Failed to rename the current branch.`, err);
        });
        // Good habit to clear cache after write operations.
        cache_1.cache.clearAll();
        const curBranchMetadataRef = new wrapper_classes_1.MetadataRef(currentBranch.name);
        curBranchMetadataRef.rename(newName);
        // Update any references to the branch.
        allBranches.forEach((branch) => {
            var _a;
            if (((_a = wrapper_classes_1.MetadataRef.getMeta(branch.name)) === null || _a === void 0 ? void 0 : _a.parentBranchName) === oldName) {
                branch.setParentBranchName(newName);
            }
        });
        utils_1.logInfo(`Successfully renamed (${oldName}) to (${chalk_1.default.green(newName)})`);
    }));
});
exports.handler = handler;
//# sourceMappingURL=rename.js.map