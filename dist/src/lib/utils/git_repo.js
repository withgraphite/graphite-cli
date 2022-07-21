"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitRepo = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const context_1 = require("../context");
const rebase_in_progress_1 = require("../git/rebase_in_progress");
const exec_sync_1 = require("./exec_sync");
const TEXT_FILE_NAME = 'test.txt';
class GitRepo {
    dir;
    userConfigPath;
    constructor(dir, opts) {
        this.dir = dir;
        this.userConfigPath = path_1.default.join(dir, '.git/.graphite_user_config');
        if (opts?.existingRepo) {
            return;
        }
        if (opts?.repoUrl) {
            (0, exec_sync_1.gpExecSync)({
                command: `git clone ${opts.repoUrl} ${dir}`,
                onError: 'throw',
            });
        }
        else {
            (0, exec_sync_1.gpExecSync)({
                command: `git init ${dir} -b main`,
                onError: 'throw',
            });
        }
    }
    execCliCommand(command, opts) {
        (0, exec_sync_1.gpExecSync)({
            command: [
                `${context_1.USER_CONFIG_OVERRIDE_ENV}=${this.userConfigPath}`,
                `GRAPHITE_DISABLE_TELEMETRY=1`,
                `GRAPHITE_DISABLE_UPGRADE_PROMPT=1`,
                `node ${__dirname}/../../../../dist/src/index.js ${command}`,
            ].join(' '),
            options: {
                stdio: process.env.DEBUG ? 'inherit' : 'ignore',
                cwd: opts?.cwd || this.dir,
            },
            onError: 'throw',
        });
    }
    execGitCommand(command, opts) {
        (0, exec_sync_1.gpExecSync)({
            command: `git ${command}`,
            options: {
                stdio: process.env.DEBUG ? 'inherit' : 'ignore',
                cwd: opts?.cwd || this.dir,
            },
            onError: 'ignore',
        });
    }
    execCliCommandAndGetOutput(command) {
        return (0, exec_sync_1.gpExecSync)({
            command: [
                `${context_1.USER_CONFIG_OVERRIDE_ENV}=${this.userConfigPath}`,
                `GRAPHITE_DISABLE_TELEMETRY=1`,
                `GRAPHITE_DISABLE_UPGRADE_PROMPT=1`,
                `node ${__dirname}/../../../../dist/src/index.js ${command}`,
            ].join(' '),
            options: {
                cwd: this.dir,
            },
            onError: 'ignore',
        });
    }
    createChange(textValue, prefix, unstaged) {
        const filePath = `${this.dir}/${prefix ? prefix + '_' : ''}${TEXT_FILE_NAME}`;
        fs_extra_1.default.writeFileSync(filePath, textValue);
        if (!unstaged) {
            (0, exec_sync_1.gpExecSync)({
                command: `git -C "${this.dir}" add ${filePath}`,
                onError: 'throw',
            });
        }
    }
    createChangeAndCommit(textValue, prefix) {
        this.createChange(textValue, prefix);
        (0, exec_sync_1.gpExecSync)({ command: `git -C "${this.dir}" add .`, onError: 'throw' });
        (0, exec_sync_1.gpExecSync)({
            command: `git -C "${this.dir}" commit -m "${textValue}"`,
            onError: 'throw',
        });
    }
    createChangeAndAmend(textValue, prefix) {
        this.createChange(textValue, prefix);
        (0, exec_sync_1.gpExecSync)({ command: `git -C "${this.dir}" add .`, onError: 'throw' });
        (0, exec_sync_1.gpExecSync)({
            command: `git -C "${this.dir}" commit --amend --no-edit`,
            onError: 'throw',
        });
    }
    deleteBranch(name) {
        (0, exec_sync_1.gpExecSync)({
            command: `git -C "${this.dir}" branch -D ${name}`,
            onError: 'throw',
        });
    }
    createPrecommitHook(contents) {
        fs_extra_1.default.mkdirpSync(`${this.dir}/.git/hooks`);
        fs_extra_1.default.writeFileSync(`${this.dir}/.git/hooks/pre-commit`, contents);
        (0, exec_sync_1.gpExecSync)({
            command: `chmod +x ${this.dir}/.git/hooks/pre-commit`,
            onError: 'throw',
        });
    }
    createAndCheckoutBranch(name) {
        (0, exec_sync_1.gpExecSync)({
            command: `git -C "${this.dir}" checkout -b "${name}"`,
            options: { stdio: process.env.DEBUG ? 'inherit' : 'ignore' },
            onError: 'throw',
        });
    }
    checkoutBranch(name) {
        (0, exec_sync_1.gpExecSync)({
            command: `git -C "${this.dir}" checkout "${name}"`,
            options: { stdio: process.env.DEBUG ? 'inherit' : 'ignore' },
            onError: 'throw',
        });
    }
    rebaseInProgress() {
        return (0, rebase_in_progress_1.rebaseInProgress)({ dir: this.dir });
    }
    resolveMergeConflicts() {
        (0, exec_sync_1.gpExecSync)({
            command: `git -C "${this.dir}" checkout --theirs .`,
            options: { stdio: process.env.DEBUG ? 'inherit' : 'ignore' },
            onError: 'throw',
        });
    }
    markMergeConflictsAsResolved() {
        (0, exec_sync_1.gpExecSync)({
            command: `git -C "${this.dir}" add .`,
            options: { stdio: process.env.DEBUG ? 'inherit' : 'ignore' },
            onError: 'throw',
        });
    }
    currentBranchName() {
        return (0, exec_sync_1.gpExecSync)({
            command: `git -C "${this.dir}" branch --show-current`,
            onError: 'ignore',
        });
    }
    getRef(refName) {
        return (0, exec_sync_1.gpExecSync)({
            command: `git -C "${this.dir}" show-ref -s ${refName}`,
            onError: 'ignore',
        });
    }
    listCurrentBranchCommitMessages() {
        return (0, exec_sync_1.gpExecSyncAndSplitLines)({
            command: `git -C "${this.dir}" log --oneline  --format=%B`,
            onError: 'ignore',
        });
    }
    mergeBranch(args) {
        (0, exec_sync_1.gpExecSync)({
            command: `git -C "${this.dir}" checkout ${args.branch}; git merge ${args.mergeIn}`,
            options: {
                stdio: process.env.DEBUG ? 'inherit' : 'ignore',
            },
            onError: 'throw',
        });
    }
}
exports.GitRepo = GitRepo;
//# sourceMappingURL=git_repo.js.map