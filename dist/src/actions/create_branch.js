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
exports.createBranchAction = void 0;
const errors_1 = require("../lib/errors");
const preconditions_1 = require("../lib/preconditions");
const utils_1 = require("../lib/utils");
const addAll_1 = require("../lib/utils/addAll");
const commit_1 = require("../lib/utils/commit");
const branch_1 = require("../wrapper-classes/branch");
// 255 minus 21 (for 'refs/branch-metadata/')
const MAX_BRANCH_NAME_BYTE_LENGTH = 234;
function createBranchAction(opts, context) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const parentBranch = preconditions_1.currentBranchPrecondition(context);
        if (opts.addAll) {
            addAll_1.addAll();
        }
        const branchName = (_a = opts.branchName) !== null && _a !== void 0 ? _a : newBranchName(context, opts.commitMessage);
        checkoutNewBranch(branchName);
        const isAddingEmptyCommit = !utils_1.detectStagedChanges();
        /**
         * Here, we silence errors and ignore them. This
         * isn't great but our main concern is that we're able to create
         * and check out the new branch and these types of error point to
         * larger failure outside of our control.
         */
        commit_1.commit({
            allowEmpty: isAddingEmptyCommit,
            message: opts.commitMessage,
            rollbackOnError: () => {
                // Commit failed, usually due to precommit hooks. Rollback the branch.
                utils_1.checkoutBranch(parentBranch.name);
                utils_1.gpExecSync({
                    command: `git branch -d ${branchName}`,
                    options: { stdio: 'ignore' },
                });
                throw new errors_1.ExitFailedError('Failed to commit changes, aborting');
            },
        });
        // If the branch previously existed and the stale metadata is still around,
        // make sure that we wipe that stale metadata.
        branch_1.Branch.create(branchName, parentBranch.name, parentBranch.getCurrentRef());
        if (isAddingEmptyCommit) {
            utils_1.logInfo('Since no changes were staged, an empty commit was added to track Graphite stack dependencies. If you wish to get rid of the empty commit you can amend, or squash when merging.');
        }
    });
}
exports.createBranchAction = createBranchAction;
function newBranchName(context, commitMessage) {
    if (!commitMessage) {
        throw new errors_1.ExitFailedError(`Must specify at least a branch name or commit message`);
    }
    const branchPrefix = context.userConfig.data.branchPrefix || '';
    const date = new Date();
    const branchDate = `${('0' + (date.getMonth() + 1)).slice(-2)}-${('0' + date.getDate()).slice(-2)}-`;
    const branchMessage = commitMessage
        .split('')
        .map((c) => {
        if (ALLOWED_BRANCH_CHARACTERS.includes(c)) {
            return c;
        }
        return '_'; // Replace all disallowed characters with _
    })
        .join('')
        .replace(/_+/g, '_'); // Condense underscores
    // https://stackoverflow.com/questions/60045157/what-is-the-maximum-length-of-a-github-branch-name
    // GitHub's max branch name size is computed based on a maximum ref name length (including
    // 'refs/heads/') of 256 bytes, so we need to convert to a Buffer and back to slice correctly.
    return Buffer.from(branchPrefix + branchDate + branchMessage)
        .slice(0, MAX_BRANCH_NAME_BYTE_LENGTH)
        .toString();
}
function checkoutNewBranch(branchName) {
    utils_1.gpExecSync({
        command: `git checkout -b "${branchName}"`,
    }, (err) => {
        throw new errors_1.ExitFailedError(`Failed to checkout new branch ${branchName}`, err);
    });
}
const ALLOWED_BRANCH_CHARACTERS = [
    '_',
    '-',
    '0',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
    'g',
    'h',
    'i',
    'j',
    'k',
    'l',
    'm',
    'n',
    'o',
    'p',
    'q',
    'r',
    's',
    't',
    'u',
    'v',
    'w',
    'x',
    'y',
    'z',
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'U',
    'V',
    'W',
    'X',
    'Y',
    'Z',
];
//# sourceMappingURL=create_branch.js.map