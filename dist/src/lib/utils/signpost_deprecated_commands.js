"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signpostDeprecatedCommands = void 0;
const splog_1 = require("./splog");
const BRANCH_WARNING = [
    'The "branch" commands "next" and "previous" (aka "bn" and "bp") are being renamed.',
    'Please use "up" and "down" (aka "bu" and "bd") respectively, as the old commands will no longer work soon.',
    'Thank you for bearing with us while we rapidly iterate!',
].join('\n');
const STACKS_WARNING = [
    'The command "stacks" has been deprecated.',
    'Please use "log short" aka "ls" instead to see your stacks, or "branch checkout" aka "bco" for an interactive checkout.',
    'Thank you for bearing with us while we rapidly iterate!',
].join('\n');
function signpostDeprecatedCommands(command) {
    if (command.length === 0)
        return;
    switch (command[0]) {
        case 'branch':
        case 'b':
            if (command[1] && ['next', 'n', 'previous', 'p'].includes(command[1])) {
                splog_1.logWarn(BRANCH_WARNING);
            }
            break;
        case 'stacks':
            splog_1.logWarn(STACKS_WARNING);
            // eslint-disable-next-line no-restricted-syntax
            process.exit(1);
    }
}
exports.signpostDeprecatedCommands = signpostDeprecatedCommands;
//# sourceMappingURL=signpost_deprecated_commands.js.map