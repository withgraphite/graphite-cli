"use strict";
exports.__esModule = true;
exports.registerSigintHandler = void 0;
var _1 = require(".");
var errors_1 = require("../errors");
function registerSigintHandler(opts) {
    process.on('SIGINT', function () {
        console.log("Gracefully terminating...");
        var err = new errors_1.KilledError();
        // End all current traces abruptly.
        _1.tracer.allSpans.forEach(function (s) { return s.end(err); });
        _1.postTelemetryInBackground({
            commandName: opts.commandName,
            canonicalCommandName: opts.canonicalCommandName,
            durationMiliSeconds: Date.now() - opts.startTime,
            err: {
                errName: err.name,
                errMessage: err.message,
                errStack: err.stack || ''
            }
        });
        // eslint-disable-next-line no-restricted-syntax
        process.exit(0);
    });
}
exports.registerSigintHandler = registerSigintHandler;
