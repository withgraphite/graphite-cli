"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.builder = exports.aliases = exports.desc = exports.command = void 0;
exports.command = 'upstack <command>';
exports.desc = 'Commands that operate upstack (inclusive) from your current branch. Run `gt upstack --help` to learn more.';
exports.aliases = ['us'];
const builder = function (yargs) {
    return yargs
        .commandDir('upstack-commands', {
        extensions: ['js'],
    })
        .strict()
        .demandCommand();
};
exports.builder = builder;
//# sourceMappingURL=upstack.js.map