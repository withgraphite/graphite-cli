"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.builder = exports.aliases = exports.desc = exports.command = void 0;
exports.command = 'downstack <command>';
exports.desc = 'Commands that operate downstack (inclusive) from your current branch. Run `gt downstack --help` to learn more.';
exports.aliases = ['ds'];
const builder = function (yargs) {
    return yargs
        .commandDir('downstack-commands', {
        extensions: ['js'],
    })
        .strict()
        .demandCommand();
};
exports.builder = builder;
//# sourceMappingURL=downstack.js.map