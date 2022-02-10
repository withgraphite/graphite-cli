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
function parseEditFile(opts) {
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
    parsedEdit.reverse(); // put trunk at the start of the list in memory, despite being bottom of list in file.
    if (parsedEdit[0].branchName !== utils_1.getTrunk().name) {
        throw new errors_1.ExitFailedError(`Cannot edit stack to no longer be branched off trunk`);
    }
    return parsedEdit
        .slice(1) // Remove the trunk
        .map((parsedStackEdit, index) => {
        // Assume all edits are PICKs for now
        return {
            type: parsedStackEdit.type,
            branchName: parsedStackEdit.branchName,
            onto: index === 0 ? utils_1.getTrunk().name : parsedEdit[index].branchName,
        };
    });
}
exports.parseEditFile = parseEditFile;
//# sourceMappingURL=parse_stack_edit_file.js.map