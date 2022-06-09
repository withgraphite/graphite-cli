"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitRepo = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const context_1 = require("../context");
const metadata_ref_1 = require("../engine/metadata_ref");
const errors_1 = require("../errors");
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
            });
        }
        else {
            (0, exec_sync_1.gpExecSync)({
                command: `git init ${dir} -b main`,
            });
        }
    }
    execCliCommand(command, opts) {
        (0, exec_sync_1.gpExecSync)({
            command: [
                `${context_1.USER_CONFIG_OVERRIDE_ENV}=${this.userConfigPath}`,
                `NODE_ENV=development`,
                `node ${__dirname}/../../../../dist/src/index.js ${command}`,
            ].join(' '),
            options: {
                stdio: process.env.DEBUG ? 'inherit' : 'ignore',
                cwd: opts?.cwd || this.dir,
            },
        }, () => {
            throw new errors_1.ExitFailedError('command failed');
        });
    }
    execGitCommand(command, opts) {
        (0, exec_sync_1.gpExecSync)({
            command: `git ${command}`,
            options: {
                stdio: process.env.DEBUG ? 'inherit' : 'ignore',
                cwd: opts?.cwd || this.dir,
            },
        });
    }
    execCliCommandAndGetOutput(command) {
        return (0, exec_sync_1.gpExecSync)({
            command: [
                `${context_1.USER_CONFIG_OVERRIDE_ENV}=${this.userConfigPath}`,
                `NODE_ENV=development`,
                `node ${__dirname}/../../../../dist/src/index.js ${command}`,
            ].join(' '),
            options: {
                cwd: this.dir,
            },
        });
    }
    createChange(textValue, prefix, unstaged) {
        const filePath = `${this.dir}/${prefix ? prefix + '_' : ''}${TEXT_FILE_NAME}`;
        fs_extra_1.default.writeFileSync(filePath, textValue);
        if (!unstaged) {
            (0, exec_sync_1.gpExecSync)({ command: `git -C "${this.dir}" add ${filePath}` });
        }
    }
    createChangeAndCommit(textValue, prefix) {
        this.createChange(textValue, prefix);
        (0, exec_sync_1.gpExecSync)({ command: `git -C "${this.dir}" add .` });
        (0, exec_sync_1.gpExecSync)({ command: `git -C "${this.dir}" commit -m "${textValue}"` });
    }
    createChangeAndAmend(textValue, prefix) {
        this.createChange(textValue, prefix);
        (0, exec_sync_1.gpExecSync)({ command: `git -C "${this.dir}" add .` });
        (0, exec_sync_1.gpExecSync)({ command: `git -C "${this.dir}" commit --amend --no-edit` });
    }
    deleteBranch(name) {
        (0, exec_sync_1.gpExecSync)({ command: `git -C "${this.dir}" branch -D ${name}` });
    }
    createPrecommitHook(contents) {
        fs_extra_1.default.mkdirpSync(`${this.dir}/.git/hooks`);
        fs_extra_1.default.writeFileSync(`${this.dir}/.git/hooks/pre-commit`, contents);
        (0, exec_sync_1.gpExecSync)({ command: `chmod +x ${this.dir}/.git/hooks/pre-commit` });
    }
    createAndCheckoutBranch(name) {
        (0, exec_sync_1.gpExecSync)({
            command: `git -C "${this.dir}" checkout -b "${name}"`,
            options: { stdio: process.env.DEBUG ? 'inherit' : 'ignore' },
        });
    }
    checkoutBranch(name) {
        (0, exec_sync_1.gpExecSync)({
            command: `git -C "${this.dir}" checkout "${name}"`,
            options: { stdio: process.env.DEBUG ? 'inherit' : 'ignore' },
        });
    }
    rebaseInProgress() {
        return (0, rebase_in_progress_1.rebaseInProgress)({ dir: this.dir });
    }
    resolveMergeConflicts() {
        (0, exec_sync_1.gpExecSync)({
            command: `git -C "${this.dir}" checkout --theirs .`,
            options: { stdio: process.env.DEBUG ? 'inherit' : 'ignore' },
        });
    }
    markMergeConflictsAsResolved() {
        (0, exec_sync_1.gpExecSync)({
            command: `git -C "${this.dir}" add .`,
            options: { stdio: process.env.DEBUG ? 'inherit' : 'ignore' },
        });
    }
    currentBranchName() {
        return (0, exec_sync_1.gpExecSync)({
            command: `git -C "${this.dir}" branch --show-current`,
        });
    }
    getRef(refName) {
        return (0, exec_sync_1.gpExecSync)({
            command: `git -C "${this.dir}" show-ref -s ${refName}`,
        });
    }
    listCurrentBranchCommitMessages() {
        return (0, exec_sync_1.gpExecSyncAndSplitLines)({
            command: `git -C "${this.dir}" log --oneline  --format=%B`,
        });
    }
    mergeBranch(args) {
        (0, exec_sync_1.gpExecSync)({
            command: `git -C "${this.dir}" checkout ${args.branch}; git merge ${args.mergeIn}`,
            options: {
                stdio: process.env.DEBUG ? 'inherit' : 'ignore',
            },
        });
    }
    upsertMeta(name, partialMeta) {
        const meta = (0, metadata_ref_1.readMetadataRef)(name, { dir: this.dir });
        (0, metadata_ref_1.writeMetadataRef)(name, { ...meta, ...partialMeta }, { dir: this.dir });
    }
}
exports.GitRepo = GitRepo;
//# sourceMappingURL=git_repo.js.map