#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const tmp_1 = __importDefault(require("tmp"));
const yargs_1 = __importDefault(require("yargs"));
const global_arguments_1 = require("./lib/global_arguments");
const passthrough_1 = require("./lib/passthrough");
const post_traces_1 = require("./lib/telemetry/post_traces");
const preprocess_command_1 = require("./lib/utils/preprocess_command");
// https://www.npmjs.com/package/tmp#graceful-cleanup
tmp_1.default.setGracefulCleanup();
process.on('uncaughtException', (err) => {
    post_traces_1.postTelemetryInBackground({
        canonicalCommandName: 'unknown',
        commandName: 'unknown',
        durationMiliSeconds: 0,
        err: {
            errName: err.name,
            errMessage: err.message,
            errStack: err.stack || '',
        },
    });
    console.log(chalk_1.default.red(`UNCAUGHT EXCEPTION: ${err.message}`));
    // eslint-disable-next-line no-restricted-syntax
    process.exit(1);
});
passthrough_1.passthrough(process.argv);
preprocess_command_1.preprocessCommand();
yargs_1.default(process.argv.slice(2))
    .commandDir('commands')
    .help()
    .usage([
    'Graphite is a command line tool that makes working with stacked changes fast & intuitive.',
].join('\n'))
    .strict()
    .options(global_arguments_1.globalArgumentsOptions)
    .global(Object.keys(global_arguments_1.globalArgumentsOptions))
    .demandCommand().argv;
//# sourceMappingURL=index.js.map