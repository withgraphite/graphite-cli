"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.builder = exports.aliases = exports.desc = exports.command = void 0;
exports.command = 'commit <command>';
exports.desc = 'Commands that operate on commits. Run `gt commit --help` to learn more.';
exports.aliases = ['c'];
const builder = function (yargs) {
    return yargs
        .commandDir('commit-commands', {
        extensions: ['js'],
    })
        .strict()
        .demandCommand();
};
exports.builder = builder;
//# sourceMappingURL=commit.js.map