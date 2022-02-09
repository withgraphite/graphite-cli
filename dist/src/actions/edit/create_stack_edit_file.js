"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStackEditFile = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const FILE_NAME = 'graphite_stack_edit';
const COLUMN_SPACING = ' '.repeat(5);
const FILE_HEADER = [`Op  `, `Branch`].join(COLUMN_SPACING);
const FILE_DIVIDER = `-`.repeat(20);
const FILE_FOOTER = '# p, pick = stack branch upon the branch from the previous line';
function createStackEditFile(opts) {
    const branchNames = opts.stack.branches().map((b) => b.name);
    const fileContents = [
        FILE_HEADER,
        FILE_DIVIDER,
        ...branchNames.map((b) => `pick${COLUMN_SPACING}${b}`),
        FILE_DIVIDER,
        FILE_FOOTER,
    ].join('\n');
    const filePath = path_1.default.join(opts.tmpDir, FILE_NAME);
    fs_extra_1.default.writeFileSync(filePath, fileContents);
    return filePath;
}
exports.createStackEditFile = createStackEditFile;
//# sourceMappingURL=create_stack_edit_file.js.map