"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.builder = exports.desc = exports.command = void 0;
exports.command = 'dash <command>';
exports.desc = 'Open the web dashboard.';
const builder = function (yargs) {
    return yargs
        .commandDir('dash-commands', {
        extensions: ['js'],
    })
        .strict()
        .demandCommand();
};
exports.builder = builder;
//# sourceMappingURL=dash.js.map