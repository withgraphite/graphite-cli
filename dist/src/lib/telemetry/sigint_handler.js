"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSigintHandler = void 0;
const errors_1 = require("../errors");
const post_traces_1 = require("./post_traces");
const tracer_1 = require("./tracer");
function registerSigintHandler(opts) {
    process.on('SIGINT', () => {
        opts.cacheLock?.release();
        const err = new errors_1.KilledError();
        // End all current traces abruptly.
        tracer_1.tracer.allSpans.forEach((s) => s.end(err));
        (0, post_traces_1.postTelemetryInBackground)({
            commandName: opts.commandName,
            canonicalCommandName: opts.canonicalCommandName,
            durationMiliSeconds: Date.now() - opts.startTime,
            err,
        });
        // eslint-disable-next-line no-restricted-syntax
        process.exit(1);
    });
}
exports.registerSigintHandler = registerSigintHandler;
//# sourceMappingURL=sigint_handler.js.map