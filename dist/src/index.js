#!/usr/bin/env node
"use strict";
/* eslint-disable no-console */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const tmp_1 = __importDefault(require("tmp"));
const yargs_1 = __importDefault(require("yargs"));
const post_traces_1 = require("./background_tasks/post_traces");
const global_arguments_1 = require("./lib/global_arguments");
const preprocess_command_1 = require("./lib/pre-yargs/preprocess_command");
// this line gets rid of warnings about "experimental fetch API" for our users
// while still showing us warnings when we test with DEBUG=1
if (!process.env.DEBUG) {
    process.removeAllListeners('warning');
}
// https://www.npmjs.com/package/tmp#graceful-cleanup
tmp_1.default.setGracefulCleanup();
process.on('uncaughtException', (err) => {
    (0, post_traces_1.postTelemetryInBackground)();
    console.log(chalk_1.default.redBright(`UNCAUGHT EXCEPTION: ${err.message}`));
    console.log(chalk_1.default.redBright(`UNCAUGHT EXCEPTION: ${err.stack}`));
    // eslint-disable-next-line no-restricted-syntax
    process.exit(1);
});
void (0, yargs_1.default)((0, preprocess_command_1.getYargsInput)())
    .commandDir('commands')
    .help()
    .usage('Graphite is a command line tool that makes working with stacked changes fast & intuitive.\n\nhttps://docs.graphite.dev/guides/graphite-cli')
    .options(global_arguments_1.globalArgumentsOptions)
    .global(Object.keys(global_arguments_1.globalArgumentsOptions))
    .strict()
    .demandCommand().argv;
//# sourceMappingURL=index.js.map