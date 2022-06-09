"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.preprocessCommand = void 0;
const deprecated_commands_1 = require("./deprecated_commands");
function splitShortcuts(command) {
    if (typeof command === 'string' &&
        command.length == 2 &&
        !['ds', 'us'].includes(command) // block list two letter noun aliases
    ) {
        return [command[0], command[1]];
    }
    if (typeof command === 'string' &&
        command.length == 3 &&
        ['bco', 'bdl', 'btr', 'but', 'brn'].includes(command) // special case two-letter shortcuts
    ) {
        return [command[0], command.slice(1)];
    }
    if (typeof command === 'string' &&
        command.length == 3 &&
        ['ds', 'us'].includes(command.slice(0, 2)) // special case two-letter noun aliases
    ) {
        return [command.slice(0, 2), command[2]];
    }
    return [command];
}
function preprocessCommand() {
    process.argv = [
        ...process.argv.slice(0, 2),
        ...splitShortcuts(process.argv[2]),
        ...process.argv.slice(3),
    ];
    (0, deprecated_commands_1.handleDeprecatedCommandNames)(process.argv.slice(2, 4));
}
exports.preprocessCommand = preprocessCommand;
//# sourceMappingURL=preprocess_command.js.map