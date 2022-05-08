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
exports.mergeDownstack = void 0;
const chalk_1 = __importDefault(require("chalk"));
const prompts_1 = __importDefault(require("prompts"));
const exec_state_config_1 = require("../../lib/config/exec_state_config");
const errors_1 = require("../../lib/errors");
const splog_1 = require("../../lib/utils/splog");
const trunk_1 = require("../../lib/utils/trunk");
const branch_1 = require("../../wrapper-classes/branch");
function mergeDownstack(branchName, context) {
    return __awaiter(this, void 0, void 0, function* () {
        const remote = context.repoConfig.getRemote();
        splog_1.logInfo(`Syncing branch ${chalk_1.default.yellow(branchName)} from remote ${remote}:`);
        const remoteParent = getRemoteParentOrThrow(branchName, remote);
        if (remoteParent !== trunk_1.getTrunk(context).name) {
            splog_1.logInfo(`${chalk_1.default.yellow(branchName)} depends on ${chalk_1.default.yellow(remoteParent)}...`);
            if ((yield mergeDownstack(remoteParent, context)) === 'ABORT') {
                return 'ABORT';
            }
        }
        if (!branch_1.Branch.exists(branchName)) {
            splog_1.logInfo(`${chalk_1.default.yellow(branchName)} does not exist locally; no merge needed.`);
            branch_1.Branch.copyFromRemote(branchName, remote);
            splog_1.logInfo(`${chalk_1.default.green(branchName)} set to match remote.`);
            return 'CONTINUE';
        }
        return handleExistingBranch(branchName, remote);
    });
}
exports.mergeDownstack = mergeDownstack;
function getRemoteParentOrThrow(branchName, remote) {
    if (!branch_1.Branch.existsOnRemote(branchName, remote)) {
        throw new errors_1.ExitFailedError([
            `Branch ${chalk_1.default.red(branchName)} does not exist on remote ${remote}`,
            `Only submitted branches can be synced from remote.`,
        ].join('\n'));
    }
    if (!branch_1.Branch.metaExistsOnRemote(branchName, remote)) {
        throw new errors_1.ExitFailedError([
            `Metadata for ${chalk_1.default.yellow(branchName)} does not exist on remote ${remote}.`,
            `Graphite can only sync branches from remote if they are submitted from a version of Graphite that supports collaboration.`,
        ].join('\n'));
    }
    const remoteParent = branch_1.Branch.getParentFromRemote(branchName, remote);
    if (!remoteParent) {
        throw new errors_1.ExitFailedError([
            `Could not find a parent for ${branchName} on remote ${remote}.`,
            `Graphite can only sync branches from remote if they are submitted from a version of Graphite that supports collaboration.`,
        ].join('\n'));
    }
    return remoteParent;
}
function handleExistingBranch(branchName, remote) {
    return __awaiter(this, void 0, void 0, function* () {
        splog_1.logInfo(`${chalk_1.default.yellow(branchName)} exists locally. Merging local state is not yet implemented.`);
        if (!exec_state_config_1.execStateConfig.interactive() ||
            !(yield prompts_1.default({
                type: 'confirm',
                name: 'value',
                message: `Discard local changes to ${chalk_1.default.yellow(branchName)} and sync from ${remote}?`,
                initial: false,
            }, {
                onCancel: () => {
                    throw new errors_1.KilledError();
                },
            }))) {
            return 'ABORT';
        }
        branch_1.Branch.copyFromRemote(branchName, remote);
        splog_1.logInfo(`${chalk_1.default.green(branchName)} set to match remote.`);
        return 'CONTINUE';
    });
}
//# sourceMappingURL=merge_downstack.js.map