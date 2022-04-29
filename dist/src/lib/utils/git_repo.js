"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitRepo = void 0;
const child_process_1 = require("child_process");
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const context_1 = require("../context/context");
const _1 = require("./");
const TEXT_FILE_NAME = 'test.txt';
class GitRepo {
    constructor(dir, opts) {
        this.dir = dir;
        this.userConfigPath = path_1.default.join(dir, '.git/.graphite_user_config');
        if (opts === null || opts === void 0 ? void 0 : opts.existingRepo) {
            return;
        }
        if (opts === null || opts === void 0 ? void 0 : opts.repoUrl) {
            child_process_1.execSync(`git clone ${opts.repoUrl} ${dir}`);
        }
        else {
            child_process_1.execSync(`git init ${dir} -b main`);
        }
    }
    execCliCommand(command, opts) {
        child_process_1.execSync([
            `${context_1.USER_CONFIG_OVERRIDE_ENV}=${this.userConfigPath}`,
            `NODE_ENV=development`,
            `node ${__dirname}/../../../../dist/src/index.js ${command}`,
        ].join(' '), {
            stdio: process.env.DEBUG ? 'inherit' : 'ignore',
            cwd: (opts === null || opts === void 0 ? void 0 : opts.cwd) || this.dir,
        });
    }
    execGitCommand(command, opts) {
        child_process_1.execSync(`git ${command}`, {
            stdio: process.env.DEBUG ? 'inherit' : 'ignore',
            cwd: (opts === null || opts === void 0 ? void 0 : opts.cwd) || this.dir,
        });
    }
    execCliCommandAndGetOutput(command) {
        return child_process_1.execSync([
            `${context_1.USER_CONFIG_OVERRIDE_ENV}=${this.userConfigPath}`,
            `NODE_ENV=development`,
            `node ${__dirname}/../../../../dist/src/index.js ${command}`,
        ].join(' '), {
            cwd: this.dir,
        })
            .toString()
            .trim();
    }
    unstagedChanges() {
        return _1.unstagedChanges();
    }
    createChange(textValue, prefix, unstaged) {
        const filePath = `${this.dir}/${prefix ? prefix + '_' : ''}${TEXT_FILE_NAME}`;
        fs_extra_1.default.writeFileSync(filePath, textValue);
        if (!unstaged) {
            child_process_1.execSync(`git -C "${this.dir}" add ${filePath}`);
        }
    }
    createChangeAndCommit(textValue, prefix) {
        this.createChange(textValue, prefix);
        child_process_1.execSync(`git -C "${this.dir}" add .`);
        child_process_1.execSync(`git -C "${this.dir}" commit -m "${textValue}"`);
    }
    createChangeAndAmend(textValue, prefix) {
        this.createChange(textValue, prefix);
        child_process_1.execSync(`git -C "${this.dir}" add .`);
        child_process_1.execSync(`git -C "${this.dir}" commit --amend --no-edit`);
    }
    deleteBranch(name) {
        child_process_1.execSync(`git -C "${this.dir}" branch -D ${name}`);
    }
    createPrecommitHook(contents) {
        fs_extra_1.default.mkdirpSync(`${this.dir}/.git/hooks`);
        fs_extra_1.default.writeFileSync(`${this.dir}/.git/hooks/pre-commit`, contents);
        child_process_1.execSync(`chmod +x ${this.dir}/.git/hooks/pre-commit`);
    }
    createAndCheckoutBranch(name) {
        child_process_1.execSync(`git -C "${this.dir}" checkout -b "${name}"`, { stdio: 'ignore' });
    }
    checkoutBranch(name) {
        child_process_1.execSync(`git -C "${this.dir}" checkout "${name}"`, { stdio: 'ignore' });
    }
    rebaseInProgress() {
        return _1.rebaseInProgress({ dir: this.dir });
    }
    resolveMergeConflicts() {
        child_process_1.execSync(`git -C "${this.dir}" checkout --theirs .`);
    }
    markMergeConflictsAsResolved() {
        child_process_1.execSync(`git -C "${this.dir}" add .`, { stdio: 'ignore' });
    }
    finishInteractiveRebase(opts) {
        while (this.rebaseInProgress()) {
            if (opts === null || opts === void 0 ? void 0 : opts.resolveMergeConflicts) {
                this.resolveMergeConflicts();
            }
            this.markMergeConflictsAsResolved();
            child_process_1.execSync(`GIT_EDITOR="touch $1" git -C ${this.dir} rebase --continue`, {
                stdio: 'ignore',
            });
        }
    }
    currentBranchName() {
        return child_process_1.execSync(`git -C "${this.dir}" branch --show-current`)
            .toString()
            .trim();
    }
    getRef(refName) {
        try {
            return child_process_1.execSync(`git -C "${this.dir}" show-ref -s ${refName}`)
                .toString()
                .trim();
        }
        catch (_a) {
            return undefined;
        }
    }
    listCurrentBranchCommitMessages() {
        return child_process_1.execSync(`git -C "${this.dir}" log --oneline  --format=%B`)
            .toString()
            .trim()
            .split('\n')
            .filter((line) => line.length > 0);
    }
    mergeBranch(args) {
        child_process_1.execSync(`git -C "${this.dir}" checkout ${args.branch}; git merge ${args.mergeIn}`, {
            stdio: 'ignore',
        });
    }
}
exports.GitRepo = GitRepo;
//# sourceMappingURL=git_repo.js.map