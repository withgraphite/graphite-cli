"use strict";
exports.__esModule = true;
exports.processGlobalArgumentsMiddleware = exports.globalArgumentsOptions = void 0;
var config_1 = require("../config");
var globalArgumentsOptions = {
    interactive: {
        alias: 'i',
        "default": true,
        type: 'boolean',
        demandOption: false
    },
    quiet: { alias: 'q', "default": false, type: 'boolean', demandOption: false },
    verify: { "default": true, type: 'boolean', demandOption: false },
    debug: { "default": false, type: 'boolean', demandOption: false }
};
exports.globalArgumentsOptions = globalArgumentsOptions;
function processGlobalArgumentsMiddleware(argv) {
    config_1.execStateConfig
        .setQuiet(argv.quiet)
        .setNoVerify(!argv.verify)
        .setInteractive(argv.interactive)
        .setOutputDebugLogs(argv.debug);
}
exports.processGlobalArgumentsMiddleware = processGlobalArgumentsMiddleware;
