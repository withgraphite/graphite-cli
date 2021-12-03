"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.builder = exports.desc = exports.command = void 0;
exports.command = "user <command>";
exports.desc = "Read or write Graphite's user configuration settings. Run `gt user --help` to learn more.";
const builder = function (yargs) {
    return yargs
        .commandDir("user-commands", {
        extensions: ["js"],
    })
        .strict()
        .demandCommand();
};
exports.builder = builder;
//# sourceMappingURL=user.js.map