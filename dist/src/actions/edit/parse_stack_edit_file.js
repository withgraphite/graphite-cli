"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseEditFile = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const errors_1 = require("../../lib/errors");
const trunk_1 = require("../../lib/utils/trunk");
const stack_edits_1 = require("./stack_edits");
// https://regex101.com/r/j0ohLA/1
const LINE_REGEX = /([a-z]*)[ ,]+(.*)/;
function parseEditFile(opts, context) {
    return fs_extra_1.default
        .readFileSync(opts.filePath)
        .toString()
        .split('\n')
        .reverse()
        .map((line) => line.substring(0, line.includes('#') ? line.indexOf('#') : line.length))
        .filter((line) => line.length > 0)
        .map((line) => parseLine(line, context));
}
exports.parseEditFile = parseEditFile;
function parseLine(line, context) {
    const match = line.match(LINE_REGEX);
    if (!match) {
        throw new errors_1.ExitFailedError(`Invalid edit: ${line}`);
    }
    const type = stack_edits_1.getStackEditType(match[1]);
    if (!type) {
        throw new errors_1.ExitFailedError(`Invalid edit: ${line}`);
    }
    return {
        pick: (rest) => {
            if (rest === trunk_1.getTrunk(context).name) {
                throw new errors_1.ExitFailedError(`Cannot perform edits on trunk branch`);
            }
            return {
                type: 'pick',
                branchName: rest,
            };
        },
        exec: (rest) => {
            return {
                type: 'exec',
                command: rest,
            };
        },
    }[type](match[2]);
}
//# sourceMappingURL=parse_stack_edit_file.js.map