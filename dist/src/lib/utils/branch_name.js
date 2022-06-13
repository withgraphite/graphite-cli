"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBranchDateEnabled = exports.setBranchPrefix = exports.newBranchName = exports.getBranchReplacement = exports.replaceUnsupportedCharacters = void 0;
// 255 minus 21 (for 'refs/branch-metadata/')
const MAX_BRANCH_NAME_BYTE_LENGTH = 234;
const BRANCH_NAME_REPLACE_REGEX = /[^-_/.a-zA-Z0-9]+/g;
function replaceUnsupportedCharacters(input, context) {
    return input.replace(BRANCH_NAME_REPLACE_REGEX, getBranchReplacement(context));
}
exports.replaceUnsupportedCharacters = replaceUnsupportedCharacters;
function getBranchReplacement(context) {
    return context.userConfig.data.branchReplacement ?? '_';
}
exports.getBranchReplacement = getBranchReplacement;
function newBranchName(branchName, commitMessage, context) {
    if (branchName) {
        return replaceUnsupportedCharacters(branchName, context);
    }
    if (!commitMessage) {
        return undefined;
    }
    const branchPrefix = context.userConfig.data.branchPrefix || '';
    const date = new Date();
    const branchDate = getBranchDateEnabled(context)
        ? `${('0' + (date.getMonth() + 1)).slice(-2)}-${('0' + date.getDate()).slice(-2)}-`
        : '';
    const branchMessage = replaceUnsupportedCharacters(commitMessage, context);
    // https://stackoverflow.com/questions/60045157/what-is-the-maximum-length-of-a-github-branch-name
    // GitHub's max branch name size is computed based on a maximum ref name length of 256 bytes.
    // We only allow single-byte characters in branch names
    return (branchPrefix + branchDate + branchMessage).slice(0, MAX_BRANCH_NAME_BYTE_LENGTH);
}
exports.newBranchName = newBranchName;
function setBranchPrefix(newPrefix, context) {
    const prefix = replaceUnsupportedCharacters(newPrefix, context);
    context.userConfig.update((data) => (data.branchPrefix = prefix));
    return prefix;
}
exports.setBranchPrefix = setBranchPrefix;
function getBranchDateEnabled(context) {
    return context.userConfig.data.branchDate ?? true;
}
exports.getBranchDateEnabled = getBranchDateEnabled;
//# sourceMappingURL=branch_name.js.map