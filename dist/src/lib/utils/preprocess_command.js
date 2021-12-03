"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.preprocessCommand = void 0;
function splitShortcuts(command) {
    if (typeof command === "string" &&
        command.length == 2 &&
        !["ds", "us"].includes(command) // block list two letter noun aliases
    ) {
        return [command[0], command[1]];
    }
    else if (typeof command === "string" &&
        command.length == 3 &&
        command === "bco" // special case this two-letter shortcut for checkout
    ) {
        return [command[0], command.slice(1)];
    }
    return [command];
}
function preprocessCommand() {
    process.argv = [
        ...process.argv.slice(0, 2),
        ...splitShortcuts(process.argv[2]),
        ...process.argv.slice(3),
    ];
}
exports.preprocessCommand = preprocessCommand;
//# sourceMappingURL=preprocess_command.js.map