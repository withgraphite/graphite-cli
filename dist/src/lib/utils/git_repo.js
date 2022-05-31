"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitRepo = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const metadata_ref_1 = require("../../wrapper-classes/metadata_ref");
const context_1 = require("../context");
const errors_1 = require("../errors");
const rebase_in_progress_1 = require("../git/rebase_in_progress");
const exec_sync_1 = require("./exec_sync");
const TEXT_FILE_NAME = 'test.txt';
class GitRepo {
    constructor(dir, opts) {
        this.dir = dir;
        this.userConfigPath = path_1.default.join(dir, '.git/.graphite_user_config');
        if (opts === null || opts === void 0 ? void 0 : opts.existingRepo) {
            return;
        }
        if (opts === null || opts === void 0 ? void 0 : opts.repoUrl) {
            exec_sync_1.gpExecSync({
                command: `git clone ${opts.repoUrl} ${dir}`,
            });
        }
        else {
            exec_sync_1.gpExecSync({
                command: `git init ${dir} -b main`,
            });
        }
    }
    execCliCommand(command, opts) {
        exec_sync_1.gpExecSync({
            command: [
                `${context_1.USER_CONFIG_OVERRIDE_ENV}=${this.userConfigPath}`,
                `NODE_ENV=development`,
                `node ${__dirname}/../../../../dist/src/index.js ${command}`,
            ].join(' '),
            options: {
                stdio: process.env.DEBUG ? 'inherit' : 'ignore',
                cwd: (opts === null || opts === void 0 ? void 0 : opts.cwd) || this.dir,
            },
        }, () => {
            throw new errors_1.ExitFailedError('command failed');
        });
    }
    execGitCommand(command, opts) {
        exec_sync_1.gpExecSync({
            command: `git ${command}`,
            options: {
                stdio: process.env.DEBUG ? 'inherit' : 'ignore',
                cwd: (opts === null || opts === void 0 ? void 0 : opts.cwd) || this.dir,
            },
        });
    }
    execCliCommandAndGetOutput(command) {
        return exec_sync_1.gpExecSync({
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
            exec_sync_1.gpExecSync({ command: `git -C "${this.dir}" add ${filePath}` });
        }
    }
    createChangeAndCommit(textValue, prefix) {
        this.createChange(textValue, prefix);
        exec_sync_1.gpExecSync({ command: `git -C "${this.dir}" add .` });
        exec_sync_1.gpExecSync({ command: `git -C "${this.dir}" commit -m "${textValue}"` });
    }
    createChangeAndAmend(textValue, prefix) {
        this.createChange(textValue, prefix);
        exec_sync_1.gpExecSync({ command: `git -C "${this.dir}" add .` });
        exec_sync_1.gpExecSync({ command: `git -C "${this.dir}" commit --amend --no-edit` });
    }
    deleteBranch(name) {
        exec_sync_1.gpExecSync({ command: `git -C "${this.dir}" branch -D ${name}` });
    }
    createPrecommitHook(contents) {
        fs_extra_1.default.mkdirpSync(`${this.dir}/.git/hooks`);
        fs_extra_1.default.writeFileSync(`${this.dir}/.git/hooks/pre-commit`, contents);
        exec_sync_1.gpExecSync({ command: `chmod +x ${this.dir}/.git/hooks/pre-commit` });
    }
    createAndCheckoutBranch(name) {
        exec_sync_1.gpExecSync({
            command: `git -C "${this.dir}" checkout -b "${name}"`,
            options: { stdio: process.env.DEBUG ? 'inherit' : 'ignore' },
        });
    }
    checkoutBranch(name) {
        exec_sync_1.gpExecSync({
            command: `git -C "${this.dir}" checkout "${name}"`,
            options: { stdio: process.env.DEBUG ? 'inherit' : 'ignore' },
        });
    }
    rebaseInProgress() {
        return rebase_in_progress_1.rebaseInProgress({ dir: this.dir });
    }
    resolveMergeConflicts() {
        exec_sync_1.gpExecSync({ command: `git -C "${this.dir}" checkout --theirs .` });
    }
    markMergeConflictsAsResolved() {
        exec_sync_1.gpExecSync({
            command: `git -C "${this.dir}" add .`,
            options: { stdio: process.env.DEBUG ? 'inherit' : 'ignore' },
        });
    }
    finishInteractiveRebase(opts) {
        while (this.rebaseInProgress()) {
            if (opts === null || opts === void 0 ? void 0 : opts.resolveMergeConflicts) {
                this.resolveMergeConflicts();
            }
            this.markMergeConflictsAsResolved();
            exec_sync_1.gpExecSync({
                command: `GIT_EDITOR="touch $1" git -C ${this.dir} rebase --continue`,
                options: {
                    stdio: process.env.DEBUG ? 'inherit' : 'ignore',
                },
            });
        }
    }
    currentBranchName() {
        return exec_sync_1.gpExecSync({
            command: `git -C "${this.dir}" branch --show-current`,
        });
    }
    getRef(refName) {
        return exec_sync_1.gpExecSync({
            command: `git -C "${this.dir}" show-ref -s ${refName}`,
        });
    }
    listCurrentBranchCommitMessages() {
        return exec_sync_1.gpExecSync({
            command: `git -C "${this.dir}" log --oneline  --format=%B`,
        })
            .split('\n')
            .filter((line) => line.length > 0);
    }
    mergeBranch(args) {
        exec_sync_1.gpExecSync({
            command: `git -C "${this.dir}" checkout ${args.branch}; git merge ${args.mergeIn}`,
            options: {
                stdio: process.env.DEBUG ? 'inherit' : 'ignore',
            },
        });
    }
    upsertMeta(name, partialMeta) {
        var _a;
        const meta = (_a = new metadata_ref_1.MetadataRef(name).read({ dir: this.dir })) !== null && _a !== void 0 ? _a : {};
        metadata_ref_1.MetadataRef.updateOrCreate(name, Object.assign(Object.assign({}, meta), partialMeta), { dir: this.dir });
    }
}
exports.GitRepo = GitRepo;
//# sourceMappingURL=git_repo.js.map