"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.builder = exports.aliases = exports.desc = exports.command = void 0;
exports.command = 'branch <command>';
exports.desc = 'Commands that operate on your current branch. Run `gt branch --help` to learn more.';
exports.aliases = ['b'];
const builder = function (yargs) {
    return yargs
        .commandDir('branch-commands', {
        extensions: ['js'],
    })
        .strict()
        .demandCommand();
};
exports.builder = builder;
//# sourceMappingURL=branch.js.map