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
exports.pruneRemoteBranchMetadata = void 0;
const chalk_1 = __importDefault(require("chalk"));
const prompts_1 = __importDefault(require("prompts"));
const exec_state_config_1 = require("../../lib/config/exec_state_config");
const errors_1 = require("../../lib/errors");
const utils_1 = require("../../lib/utils");
function pruneRemoteBranchMetadata(context, force) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!context.userConfig.data.experimental) {
            return;
        }
        const remote = context.repoConfig.getRemote();
        const branchesNeedingPruning = utils_1.gpExecSync({
            command: `git for-each-ref --format="%(refname)" "refs/${remote}-branch-metadata/"`,
        })
            .toString()
            .trim()
            .split('\n')
            .map((remoteBranchMetadataPath) => remoteBranchMetadataPath.replace(`refs/${remote}-branch-metadata/`, `refs/remotes/${remote}/`))
            .filter((remoteBranchPath) => utils_1.gpExecSync({
            command: `git show-ref ${remoteBranchPath}`,
            options: {},
        }).length === 0)
            .map((remoteBranchPath) => remoteBranchPath.replace(`refs/remotes/${remote}/`, ''));
        if (branchesNeedingPruning.length === 0) {
            return;
        }
        const hasMultipleBranches = branchesNeedingPruning.length > 1;
        utils_1.logInfo(`Remote ${remote} has Graphite metadata for the following branch${hasMultipleBranches ? 'es that no longer exist' : ' that no longer exists'}:`);
        branchesNeedingPruning.forEach((branchName) => utils_1.logInfo(`▸ ${chalk_1.default.yellow(branchName)}`));
        if (!force &&
            (!exec_state_config_1.execStateConfig.interactive() ||
                !(yield prompts_1.default({
                    type: 'confirm',
                    name: 'value',
                    message: `Would you like to delete the unused refs from ${remote}?`,
                    initial: true,
                }, {
                    onCancel: () => {
                        throw new errors_1.KilledError();
                    },
                })).value)) {
            return;
        }
        utils_1.logInfo(`Pruning remote metadata...`);
        branchesNeedingPruning.forEach((branchName) => {
            utils_1.gpExecSync({
                command: `git push ${remote} -d refs/branch-metadata/${branchName}`,
            });
            utils_1.gpExecSync({
                command: `git update-ref -d refs/${remote}-branch-metadata/${branchName}`,
            });
        });
        utils_1.logNewline();
    });
}
exports.pruneRemoteBranchMetadata = pruneRemoteBranchMetadata;
//# sourceMappingURL=prune_remote_branch_metadata.js.map