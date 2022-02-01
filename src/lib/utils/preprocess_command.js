"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.preprocessCommand = void 0;
function splitShortcuts(command) {
    if (typeof command === 'string' &&
        command.length == 2 &&
        !['ds', 'us'].includes(command) // block list two letter noun aliases
    ) {
        return [command[0], command[1]];
    }
    else if (typeof command === 'string' &&
        command.length == 3 &&
        command === 'bco' // special case this two-letter shortcut for checkout
    ) {
        return [command[0], command.slice(1)];
    }
    return [command];
}
function preprocessCommand() {
    process.argv = __spreadArrays(process.argv.slice(0, 2), splitShortcuts(process.argv[2]), process.argv.slice(3));
}
exports.preprocessCommand = preprocessCommand;
