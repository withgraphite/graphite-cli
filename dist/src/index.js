#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const tmp_1 = __importDefault(require("tmp"));
const yargs_1 = __importDefault(require("yargs"));
const globalArguments_1 = require("./lib/globalArguments");
const passthrough_1 = require("./lib/passthrough");
const post_traces_1 = require("./lib/telemetry/post_traces");
const preprocess_command_1 = require("./lib/utils/preprocess_command");
const signpost_deprecated_commands_1 = require("./lib/utils/signpost_deprecated_commands");
const splog_1 = require("./lib/utils/splog");
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
    splog_1.logError(err.message);
    // eslint-disable-next-line no-restricted-syntax
    process.exit(1);
});
function deprecatedGpWarning(argv) {
    if (argv['$0'].endsWith('gp')) {
        console.log(chalk_1.default.red(`Warning: Based on feedback, we've updated the Graphite CLI alias to "gt". The alias "gp" has been deprecated.`));
        // eslint-disable-next-line no-restricted-syntax
        process.exit(1);
    }
}
passthrough_1.passthrough(process.argv);
preprocess_command_1.preprocessCommand();
signpost_deprecated_commands_1.signpostDeprecatedCommands(process.argv.slice(2));
yargs_1.default(process.argv.slice(2))
    .commandDir('commands')
    .help()
    .middleware(deprecatedGpWarning)
    .usage([
    'Graphite is a command line tool that makes working with stacked changes fast & intuitive.',
].join('\n'))
    .options(globalArguments_1.globalArgumentsOptions)
    .middleware(globalArguments_1.processGlobalArgumentsMiddleware)
    .strict()
    .demandCommand().argv;
//# sourceMappingURL=index.js.map