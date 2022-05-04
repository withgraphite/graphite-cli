"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.indentMultilineString = void 0;
function indentMultilineString(lines, indent) {
    return lines
        .split('\n')
        .map((l) => ' '.repeat(indent) + l)
        .join('\n');
}
exports.indentMultilineString = indentMultilineString;
//# sourceMappingURL=indent_multiline_string.js.map