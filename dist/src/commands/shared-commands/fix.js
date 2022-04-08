"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aliases = exports.builder = exports.args = exports.command = void 0;
exports.command = 'fix';
exports.args = {
    rebase: {
        describe: `Fix your stack by recursively rebasing branches onto their parents, as recorded in Graphite's stack metadata.`,
        demandOption: false,
        default: false,
        type: 'boolean',
    },
    regen: {
        describe: `Regenerate Graphite's stack metadata from the branch relationships in the git commit tree, overwriting the previous Graphite stack metadata.`,
        demandOption: false,
        default: false,
        type: 'boolean',
    },
};
exports.builder = exports.args;
exports.aliases = ['f'];
//# sourceMappingURL=fix.js.map