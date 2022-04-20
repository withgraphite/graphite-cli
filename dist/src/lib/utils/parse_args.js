"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseArgs = void 0;
function parseArgs(args) {
    return {
        command: args['_'].join(' '),
        alias: args['$0'],
        args: Object.keys(args)
            .filter((k) => k != '_' && k != '$0')
            .map((k) => `--${k} "${args[k]}"`)
            .join(' '),
    };
}
exports.parseArgs = parseArgs;
//# sourceMappingURL=parse_args.js.map