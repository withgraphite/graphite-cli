"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.builder = exports.aliases = exports.desc = exports.command = void 0;
exports.command = "log <command>";
exports.desc = "Commands that log your stacks.";
exports.aliases = ["l"];
const builder = function (yargs) {
    return yargs
        .commandDir("log-commands", {
        extensions: ["js"],
    })
        .strict()
        .demandCommand();
};
exports.builder = builder;
//# sourceMappingURL=log.js.map