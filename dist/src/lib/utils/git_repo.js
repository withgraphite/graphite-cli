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
const run_command_1 = require("./run_command");
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
            (0, run_command_1.runGitCommand)({
                args: [`clone`, opts.repoUrl, dir],
                onError: 'throw',
                resource: null,
            });
        }
        else {
            (0, run_command_1.runGitCommand)({
                args: [`init`, dir, `-b`, `main`],
                onError: 'throw',
                resource: null,
            });
        }
    }
    runCliCommand(command, opts) {
        (0, run_command_1.runCommand)({
            command: process.argv[0],
            args: [
                path_1.default.join(__dirname, `..`, `..`, `..`, `..`, `dist`, `src`, `index.js`),
                ...command,
            ],
            options: {
                stdio: process.env.DEBUG ? 'inherit' : 'pipe',
                cwd: opts?.cwd || this.dir,
                env: {
                    ...process.env,
                    [context_1.USER_CONFIG_OVERRIDE_ENV]: this.userConfigPath,
                    GRAPHITE_DISABLE_TELEMETRY: '1',
                    GRAPHITE_DISABLE_UPGRADE_PROMPT: '1',
                },
            },
            onError: 'throw',
        });
    }
    runGitCommand(args, opts) {
        (0, run_command_1.runGitCommand)({
            args,
            options: {
                stdio: process.env.DEBUG ? 'inherit' : 'pipe',
                cwd: opts?.cwd || this.dir,
            },
            onError: 'ignore',
            resource: null,
        });
    }
    runCliCommandAndGetOutput(args) {
        return (0, run_command_1.runCommand)({
            command: process.argv[0],
            args: [
                path_1.default.join(__dirname, `..`, `..`, `..`, `..`, `dist`, `src`, `index.js`),
                ...args,
            ],
            options: {
                cwd: this.dir,
                env: {
                    ...process.env,
                    [context_1.USER_CONFIG_OVERRIDE_ENV]: this.userConfigPath,
                    GRAPHITE_DISABLE_TELEMETRY: '1',
                    GRAPHITE_DISABLE_UPGRADE_PROMPT: '1',
                },
            },
            onError: 'ignore',
        });
    }
    createChange(textValue, prefix, unstaged) {
        const filePath = path_1.default.join(`${this.dir}`, `${prefix ? prefix + '_' : ''}${TEXT_FILE_NAME}`);
        fs_extra_1.default.writeFileSync(filePath, textValue);
        if (!unstaged) {
            (0, run_command_1.runGitCommand)({
                args: [`add`, filePath],
                options: { cwd: this.dir },
                onError: 'throw',
                resource: null,
            });
        }
    }
    createChangeAndCommit(textValue, prefix) {
        this.createChange(textValue, prefix);
        (0, run_command_1.runGitCommand)({
            args: [`add`, `.`],
            options: { cwd: this.dir },
            onError: 'throw',
            resource: null,
        });
        (0, run_command_1.runGitCommand)({
            args: [`commit`, `-m`, textValue],
            options: { cwd: this.dir },
            onError: 'throw',
            resource: null,
        });
    }
    createChangeAndAmend(textValue, prefix) {
        this.createChange(textValue, prefix);
        (0, run_command_1.runGitCommand)({
            args: [`add`, `.`],
            options: { cwd: this.dir },
            onError: 'throw',
            resource: null,
        });
        (0, run_command_1.runGitCommand)({
            args: [`commit`, `--amend`, `--no-edit`],
            options: { cwd: this.dir },
            onError: 'throw',
            resource: null,
        });
    }
    deleteBranch(name) {
        (0, run_command_1.runGitCommand)({
            args: [`branch`, `-D`, name],
            options: { cwd: this.dir },
            onError: 'throw',
            resource: null,
        });
    }
    createPrecommitHook(contents) {
        fs_extra_1.default.mkdirpSync(`${this.dir}/.git/hooks`);
        fs_extra_1.default.writeFileSync(`${this.dir}/.git/hooks/pre-commit`, contents);
        (0, run_command_1.runCommand)({
            command: `chmod`,
            args: [`+x`, `${this.dir}/.git/hooks/pre-commit`],
            options: { cwd: this.dir },
            onError: 'throw',
        });
    }
    createAndCheckoutBranch(name) {
        (0, run_command_1.runGitCommand)({
            args: [`checkout`, `-b`, name],
            options: {
                stdio: process.env.DEBUG ? 'inherit' : 'pipe',
                cwd: this.dir,
            },
            onError: 'throw',
            resource: null,
        });
    }
    checkoutBranch(name) {
        (0, run_command_1.runGitCommand)({
            args: [`checkout`, name],
            options: {
                stdio: process.env.DEBUG ? 'inherit' : 'pipe',
                cwd: this.dir,
            },
            onError: 'throw',
            resource: null,
        });
    }
    rebaseInProgress() {
        return (0, rebase_in_progress_1.rebaseInProgress)({ cwd: this.dir });
    }
    resolveMergeConflicts() {
        (0, run_command_1.runGitCommand)({
            args: [`checkout`, `--theirs`, `.`],
            options: {
                stdio: process.env.DEBUG ? 'inherit' : 'pipe',
                cwd: this.dir,
            },
            onError: 'throw',
            resource: null,
        });
    }
    markMergeConflictsAsResolved() {
        (0, run_command_1.runGitCommand)({
            args: [`add`, `.`],
            options: {
                stdio: process.env.DEBUG ? 'inherit' : 'pipe',
                cwd: this.dir,
            },
            onError: 'throw',
            resource: null,
        });
    }
    currentBranchName() {
        return (0, run_command_1.runGitCommand)({
            args: [`branch`, `--show-current`],
            options: { cwd: this.dir },
            onError: 'ignore',
            resource: null,
        });
    }
    getRef(refName) {
        return (0, run_command_1.runGitCommand)({
            args: [`show-ref`, `-s`, refName],
            options: { cwd: this.dir },
            onError: 'ignore',
            resource: null,
        });
    }
    listCurrentBranchCommitMessages() {
        return (0, run_command_1.runGitCommandAndSplitLines)({
            args: [`log`, `--oneline`, `--format=%B`],
            options: { cwd: this.dir },
            onError: 'ignore',
            resource: null,
        });
    }
    mergeBranch(args) {
        this.checkoutBranch(args.branch);
        (0, run_command_1.runGitCommand)({
            args: [`merge`, args.mergeIn],
            options: {
                cwd: this.dir,
                stdio: process.env.DEBUG ? 'inherit' : 'pipe',
            },
            onError: 'throw',
            resource: null,
        });
    }
}
exports.GitRepo = GitRepo;
//# sourceMappingURL=git_repo.js.map