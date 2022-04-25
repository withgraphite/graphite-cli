"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.builder = exports.desc = exports.command = exports.aliases = void 0;
exports.aliases = ['r'];
exports.command = 'repo <command>';
exports.desc = "Read or write Graphite's configuration settings for the current repo. Run `gt repo --help` to learn more.";
const builder = function (yargs) {
    return yargs
        .commandDir('repo-commands', {
        extensions: ['js'],
    })
        .strict()
        .demandCommand();
};
exports.builder = builder;
//# sourceMappingURL=repo.js.map