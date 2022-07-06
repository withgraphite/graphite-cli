"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getYargsInput = void 0;
const deprecated_commands_1 = require("./deprecated_commands");
const passthrough_1 = require("./passthrough");
function splitShortcuts(command) {
    if (command.length === 2 &&
        !['ds', 'us'].includes(command) // block list two letter noun aliases
    ) {
        return [command[0], command[1]];
    }
    if (command.length === 3 &&
        ['bco', 'bdl', 'btr', 'but', 'brn', 'bsq', 'dpr'].includes(command) // special case three-letter shortcuts
    ) {
        return [command[0], command.slice(1)];
    }
    if (command.length === 3 &&
        ['ds', 'us'].includes(command.slice(0, 2)) // special case two-letter noun aliases
    ) {
        return [command.slice(0, 2), command[2]];
    }
    return [command];
}
function getYargsInput() {
    (0, passthrough_1.passthrough)(process.argv);
    if (process.argv.length < 3) {
        return [];
    }
    const yargsInput = [
        ...splitShortcuts(process.argv[2]),
        ...process.argv.slice(3),
    ];
    (0, deprecated_commands_1.handleDeprecatedCommandNames)(yargsInput.slice(0, 2));
    return yargsInput;
}
exports.getYargsInput = getYargsInput;
//# sourceMappingURL=preprocess_command.js.map