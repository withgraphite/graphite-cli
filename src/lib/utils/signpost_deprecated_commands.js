"use strict";
exports.__esModule = true;
exports.signpostDeprecatedCommands = void 0;
var splog_1 = require("./splog");
function signpostDeprecatedCommands(command) {
    switch (command) {
        case 'stacks':
            splog_1.logWarn([
                'The command "stacks" has been deprecated.',
                'Please use "log short" aka "ls" instead to see your stacks, or "branch checkout" aka "bco" for an interactive checkout.',
                'Thank you for bearing with us while we rapidly iterate!',
            ].join('\n'));
            // eslint-disable-next-line no-restricted-syntax
            process.exit(1);
    }
}
exports.signpostDeprecatedCommands = signpostDeprecatedCommands;
