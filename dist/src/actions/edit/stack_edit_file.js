"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseEditFile = exports.createStackEditFile = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const FILE_NAME = 'graphite_stack_edit';
const FILE_FOOTER = [
    '#',
    '# Stack will be rearranged on trunk to match the above order.',
];
/* Example file:

gf--02-09-second
gf--02-09-first
# main (trunk, shown for orientation)
#
# Stack will be rearranged on trunk to match the above order.
*/
function createStackEditFile(opts, context) {
    // show the trunk at the bottom of the list to better match "upstack" and "downstack"
    const fileContents = [
        ...opts.branchNames.reverse(),
        `# ${context.metaCache.trunk} (trunk, shown for orientation)`,
        ...FILE_FOOTER,
    ].join('\n');
    const filePath = path_1.default.join(opts.tmpDir, FILE_NAME);
    fs_extra_1.default.writeFileSync(filePath, fileContents);
    return filePath;
}
exports.createStackEditFile = createStackEditFile;
function parseEditFile(filePath) {
    return fs_extra_1.default
        .readFileSync(filePath)
        .toString()
        .split('\n')
        .reverse()
        .map((line) => line.substring(0, line.includes('#') ? line.indexOf('#') : line.length))
        .filter((line) => line.length > 0);
}
exports.parseEditFile = parseEditFile;
//# sourceMappingURL=stack_edit_file.js.map