"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.q = void 0;
const SINGLE_QUOTE_REGEX = /'/g;
const SINGLE_QUOTE = "'";
const BACKSLASH = '\\';
function q(source) {
    return `${SINGLE_QUOTE}${source.replace(SINGLE_QUOTE_REGEX, `${SINGLE_QUOTE}${BACKSLASH}${SINGLE_QUOTE}${SINGLE_QUOTE}`)}${SINGLE_QUOTE}`;
}
exports.q = q;
//# sourceMappingURL=escape_for_shell.js.map