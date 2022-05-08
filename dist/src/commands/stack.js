"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.builder = exports.aliases = exports.desc = exports.command = void 0;
exports.command = 'stack <command>';
exports.desc = 'Commands that operate on your current stack of branches. Run `gt stack --help` to learn more.';
exports.aliases = ['s'];
const builder = function (yargs) {
    return yargs
        .commandDir('stack-commands', {
        extensions: ['js'],
    })
        .strict()
        .demandCommand();
};
exports.builder = builder;
//# sourceMappingURL=stack.js.map