"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.builder = exports.desc = exports.aliases = exports.command = void 0;
exports.command = 'dash <command>';
exports.aliases = ['d'];
exports.desc = 'Open the web dashboard.';
const builder = function (yargs) {
    return yargs
        .commandDir('dash-commands', {
        extensions: ['js'],
    })
        .strict();
};
exports.builder = builder;
//# sourceMappingURL=dash.js.map