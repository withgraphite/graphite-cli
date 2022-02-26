"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStackEditFile = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const utils_1 = require("../../lib/utils");
const FILE_NAME = 'graphite_stack_edit';
const COLUMN_SPACING = ' '.repeat(5);
const FILE_FOOTER = [
    '#',
    '# Operations:',
    "# p, pick = stack onto the proceeding line's branch",
];
/* Example file:

pick    gf--02-09-second
pick    gf--02-09-first

# pick  main (Bottom of stack)
#
# Operations:
# pick <branch_name> stack branch upon the branch from the previous line

*/
function createStackEditFile(opts, context) {
    const trunkName = utils_1.getTrunk(context).name;
    const branchNames = opts.stack
        .branches()
        .map((b) => b.name)
        .filter((n) => n !== trunkName);
    branchNames.reverse(); // show the trunk at the bottom of the list to better match "upstack" and "downstack"
    const fileContents = [
        ...branchNames.map((b) => `pick${COLUMN_SPACING}${b}`),
        `\n# pick   ${trunkName} (trunk, shown for orientation)`,
        ...FILE_FOOTER,
    ].join('\n');
    const filePath = path_1.default.join(opts.tmpDir, FILE_NAME);
    fs_extra_1.default.writeFileSync(filePath, fileContents);
    return filePath;
}
exports.createStackEditFile = createStackEditFile;
//# sourceMappingURL=create_stack_edit_file.js.map