"use strict";
exports.__esModule = true;
exports.parseArgs = void 0;
function parseArgs(args) {
    return {
        command: args['_'].join(' '),
        alias: args['$0'],
        args: Object.keys(args)
            .filter(function (k) { return k != '_' && k != '$0'; })
            .map(function (k) { return "--" + k + " \"" + args[k] + "\""; })
            .join(' ')
    };
}
exports.parseArgs = parseArgs;
