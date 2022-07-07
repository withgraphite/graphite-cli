"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.canonical = exports.description = exports.command = exports.builder = exports.args = exports.aliases = void 0;
const submit_action_1 = require("../../actions/submit/submit_action");
const scope_spec_1 = require("../../lib/engine/scope_spec");
const runner_1 = require("../../lib/runner");
var submit_1 = require("../shared-commands/submit");
Object.defineProperty(exports, "aliases", { enumerable: true, get: function () { return submit_1.aliases; } });
Object.defineProperty(exports, "args", { enumerable: true, get: function () { return submit_1.args; } });
Object.defineProperty(exports, "builder", { enumerable: true, get: function () { return submit_1.builder; } });
Object.defineProperty(exports, "command", { enumerable: true, get: function () { return submit_1.command; } });
exports.description = 'Idempotently force push the current branch and its descendants to GitHub, creating or updating pull requests as necessary.';
exports.canonical = 'upstack submit';
const handler = async (argv) => {
    await (0, runner_1.graphite)(argv, exports.canonical, async (context) => {
        context.splog.tip([
            `You are submitting with upstack scope.`,
            `In common cases, we recommend you use:`,
            `▸ gt stack submit`,
            `▸ gt downstack submit`,
            `because these will ensure any downstack changes will be synced to existing PRs.`,
            `This submit will fail if the current branch's remote parent doesn't match its local base.`,
        ].join('\n'));
        await (0, submit_action_1.submitAction)({
            scope: scope_spec_1.SCOPE.UPSTACK,
            editPRFieldsInline: argv.edit,
            draft: argv.draft,
            publish: argv.publish,
            dryRun: argv['dry-run'],
            updateOnly: argv['update-only'],
            reviewers: argv.reviewers,
            confirm: argv.confirm,
        }, context);
    });
};
exports.handler = handler;
//# sourceMappingURL=submit.js.map