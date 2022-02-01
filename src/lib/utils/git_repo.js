"use strict";
exports.__esModule = true;
var child_process_1 = require("child_process");
var fs_extra_1 = require("fs-extra");
var _1 = require("./");
var TEXT_FILE_NAME = 'test.txt';
var GitRepo = /** @class */ (function () {
    function GitRepo(dir, opts) {
        this.dir = dir;
        if (opts === null || opts === void 0 ? void 0 : opts.existingRepo) {
            return;
        }
        if (opts === null || opts === void 0 ? void 0 : opts.repoUrl) {
            child_process_1.execSync("git clone " + opts.repoUrl + " " + dir);
        }
        else {
            child_process_1.execSync("git init " + dir + " -b main");
        }
    }
    GitRepo.prototype.execCliCommand = function (command) {
        child_process_1.execSync("NODE_ENV=development node " + __dirname + "/../../../../dist/src/index.js " + command, {
            stdio: process.env.DEBUG ? 'inherit' : 'ignore',
            cwd: this.dir
        });
    };
    GitRepo.prototype.execCliCommandAndGetOutput = function (command) {
        return child_process_1.execSync("NODE_ENV=development node " + __dirname + "/../../../../dist/src/index.js " + command, {
            cwd: this.dir
        })
            .toString()
            .trim();
    };
    GitRepo.prototype.unstagedChanges = function () {
        return _1.unstagedChanges();
    };
    GitRepo.prototype.createChange = function (textValue, prefix, unstaged) {
        var filePath = this.dir + "/" + (prefix ? prefix + '_' : '') + TEXT_FILE_NAME;
        fs_extra_1["default"].writeFileSync(filePath, textValue);
        if (!unstaged) {
            child_process_1.execSync("git -C \"" + this.dir + "\" add " + filePath);
        }
    };
    GitRepo.prototype.createChangeAndCommit = function (textValue, prefix) {
        this.createChange(textValue, prefix);
        child_process_1.execSync("git -C \"" + this.dir + "\" add .");
        child_process_1.execSync("git -C \"" + this.dir + "\" commit -m \"" + textValue + "\"");
    };
    GitRepo.prototype.createChangeAndAmend = function (textValue, prefix) {
        this.createChange(textValue, prefix);
        child_process_1.execSync("git -C \"" + this.dir + "\" add .");
        child_process_1.execSync("git -C \"" + this.dir + "\" commit --amend --no-edit");
    };
    GitRepo.prototype.deleteBranch = function (name) {
        child_process_1.execSync("git -C \"" + this.dir + "\" branch -D " + name);
    };
    GitRepo.prototype.createPrecommitHook = function (contents) {
        fs_extra_1["default"].mkdirpSync(this.dir + "/.git/hooks");
        fs_extra_1["default"].writeFileSync(this.dir + "/.git/hooks/pre-commit", contents);
        child_process_1.execSync("chmod +x " + this.dir + "/.git/hooks/pre-commit");
    };
    GitRepo.prototype.createAndCheckoutBranch = function (name) {
        child_process_1.execSync("git -C \"" + this.dir + "\" checkout -b \"" + name + "\"", { stdio: 'ignore' });
    };
    GitRepo.prototype.checkoutBranch = function (name) {
        child_process_1.execSync("git -C \"" + this.dir + "\" checkout \"" + name + "\"", { stdio: 'ignore' });
    };
    GitRepo.prototype.rebaseInProgress = function () {
        return _1.rebaseInProgress({ dir: this.dir });
    };
    GitRepo.prototype.resolveMergeConflicts = function () {
        child_process_1.execSync("git -C \"" + this.dir + "\" checkout --theirs .");
    };
    GitRepo.prototype.markMergeConflictsAsResolved = function () {
        child_process_1.execSync("git -C \"" + this.dir + "\" add .", { stdio: 'ignore' });
    };
    GitRepo.prototype.finishInteractiveRebase = function (opts) {
        while (this.rebaseInProgress()) {
            if (opts === null || opts === void 0 ? void 0 : opts.resolveMergeConflicts) {
                this.resolveMergeConflicts();
            }
            this.markMergeConflictsAsResolved();
            child_process_1.execSync("GIT_EDITOR=\"touch $1\" git -C " + this.dir + " rebase --continue", {
                stdio: 'ignore'
            });
        }
    };
    GitRepo.prototype.currentBranchName = function () {
        return child_process_1.execSync("git -C \"" + this.dir + "\" branch --show-current")
            .toString()
            .trim();
    };
    GitRepo.prototype.listCurrentBranchCommitMessages = function () {
        return child_process_1.execSync("git -C \"" + this.dir + "\" log --oneline  --format=%B")
            .toString()
            .trim()
            .split('\n')
            .filter(function (line) { return line.length > 0; });
    };
    GitRepo.prototype.mergeBranch = function (args) {
        child_process_1.execSync("git -C \"" + this.dir + "\" checkout " + args.branch + "; git merge " + args.mergeIn, {
            stdio: 'ignore'
        });
    };
    return GitRepo;
}());
exports["default"] = GitRepo;
