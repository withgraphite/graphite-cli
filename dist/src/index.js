#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const semver_1 = __importDefault(require("semver"));
const tmp_1 = __importDefault(require("tmp"));
const yargs_1 = __importDefault(require("yargs"));
const global_arguments_1 = require("./lib/global_arguments");
const preprocess_command_1 = require("./lib/pre-yargs/preprocess_command");
const post_traces_1 = require("./lib/telemetry/post_traces");
// this line gets rid of warnings about "experimental fetch API" for our users
// while still showing us warnings when we test with DEBUG=1
if (!process.env.DEBUG) {
    process.removeAllListeners('warning');
}
const requiredVersion = '>=v14';
if (!semver_1.default.satisfies(process.version, requiredVersion)) {
    console.error(`Required node version ${requiredVersion} not satisfied with current version ${process.version}.`);
    // eslint-disable-next-line no-restricted-syntax
    process.exit(1);
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
    .usage('Graphite is a command line tool that makes working with stacked changes fast & intuitive.')
    .options(global_arguments_1.globalArgumentsOptions)
    .global(Object.keys(global_arguments_1.globalArgumentsOptions))
    .strict()
    .demandCommand().argv;
//# sourceMappingURL=index.js.map