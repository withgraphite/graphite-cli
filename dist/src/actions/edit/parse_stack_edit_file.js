"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseEditFile = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const errors_1 = require("../../lib/errors");
const utils_1 = require("../../lib/utils");
const stack_edits_1 = require("./stack_edits");
function parseEditFile(opts, context) {
    const fileContents = fs_extra_1.default.readFileSync(opts.filePath).toString();
    const parsedEdit = fileContents
        .split('\n')
        .map((line) => line.split(/[ ,]+/))
        .filter((lineParts) => {
        // Each line, we want to split into two parts (edit type and branch name)
        return lineParts.length === 2 && stack_edits_1.isValidStackEditType(lineParts[0]);
    })
        .map((lineParts) => {
        return { type: lineParts[0], branchName: lineParts[1] };
    });
    parsedEdit.reverse();
    if (parsedEdit.map((e) => e.branchName).includes(utils_1.getTrunk(context).name)) {
        throw new errors_1.ExitFailedError(`Cannot perform edits on trunk branch`);
    }
    return parsedEdit.map((parsedStackEdit, index) => {
        // Assume all edits are PICKs for now
        return {
            type: parsedStackEdit.type,
            branchName: parsedStackEdit.branchName,
            onto: index === 0 ? utils_1.getTrunk(context).name : parsedEdit[index - 1].branchName,
        };
    });
}
exports.parseEditFile = parseEditFile;
//# sourceMappingURL=parse_stack_edit_file.js.map