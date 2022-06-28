"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.description = exports.canonical = exports.command = void 0;
const graphite_cli_routes_1 = require("@withgraphite/graphite-cli-routes");
const retyped_routes_1 = require("@withgraphite/retyped-routes");
const chalk_1 = __importDefault(require("chalk"));
const server_1 = require("../../lib/api/server");
const debug_context_1 = require("../../lib/debug_context");
const errors_1 = require("../../lib/errors");
const get_email_1 = require("../../lib/git/get_email");
const runner_1 = require("../../lib/runner");
const args = {
    message: {
        type: 'string',
        positional: true,
        demandOption: true,
        describe: 'Positive or constructive feedback for the Graphite team! Jokes are chill too.',
    },
    'with-debug-context': {
        type: 'boolean',
        default: false,
        describe: "Include a blob of json describing your repo's state to help with debugging. Run 'gt feedback debug-context' to see what would be included.",
    },
};
exports.command = '* <message>';
exports.canonical = 'feedback';
exports.description = "Post a string directly to the maintainers' Slack where they can factor in your feedback, laugh at your jokes, cry at your insults, or test the bounds of Slack injection attacks.";
exports.builder = args;
const handler = async (argv) => {
    return (0, runner_1.graphite)(argv, exports.canonical, async (context) => {
        const user = (0, get_email_1.getUserEmail)();
        if (!argv.message) {
            throw new errors_1.ExitFailedError(`No message provided`);
        }
        const response = await retyped_routes_1.request.requestWithArgs(server_1.API_SERVER, graphite_cli_routes_1.API_ROUTES.feedback, {
            user: user || 'NotFound',
            message: argv.message,
            debugContext: argv['with-debug-context']
                ? (0, debug_context_1.captureState)(context)
                : undefined,
        });
        if (response._response.status === 200) {
            context.splog.info(chalk_1.default.green(`Feedback received loud and clear (in a team Slack channel) 😊`));
        }
        else {
            throw new errors_1.ExitFailedError(`Failed to report feedback, network response ${response.status}`);
        }
    });
};
exports.handler = handler;
//# sourceMappingURL=default.js.map