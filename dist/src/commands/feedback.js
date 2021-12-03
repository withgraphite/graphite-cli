"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.builder = exports.desc = exports.command = void 0;
exports.command = "feedback <command>";
exports.desc = "Commands for providing feedback and debug state.";
const builder = function (yargs) {
    return yargs
        .commandDir("feedback-commands", {
        extensions: ["js"],
    })
        .strict()
        .demandCommand();
};
exports.builder = builder;
//# sourceMappingURL=feedback.js.map