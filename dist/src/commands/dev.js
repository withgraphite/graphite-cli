"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.builder = exports.description = exports.command = void 0;
exports.command = 'dev <command>';
exports.description = false;
const builder = function (yargs) {
    return yargs
        .commandDir('dev-commands', {
        extensions: ['js'],
    })
        .strict()
        .demandCommand();
};
exports.builder = builder;
//# sourceMappingURL=dev.js.map