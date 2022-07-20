"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.canonical = exports.description = exports.command = exports.builder = exports.aliases = void 0;
const submit_action_1 = require("../../actions/submit/submit_action");
const scope_spec_1 = require("../../lib/engine/scope_spec");
const runner_1 = require("../../lib/runner");
var submit_1 = require("../shared-commands/submit");
Object.defineProperty(exports, "aliases", { enumerable: true, get: function () { return submit_1.aliases; } });
Object.defineProperty(exports, "builder", { enumerable: true, get: function () { return submit_1.builder; } });
Object.defineProperty(exports, "command", { enumerable: true, get: function () { return submit_1.command; } });
exports.description = 'Idempotently force push all branches from trunk to the current branch to GitHub, creating or updating distinct pull requests for each.';
exports.canonical = 'downstack submit';
const handler = async (argv) => {
    await (0, runner_1.graphite)(argv, exports.canonical, async (context) => {
        await (0, submit_action_1.submitAction)({
            scope: scope_spec_1.SCOPE.DOWNSTACK,
            editPRFieldsInline: !argv['no-edit'] && argv.edit,
            draft: argv.draft,
            publish: argv.publish,
            dryRun: argv['dry-run'],
            updateOnly: argv['update-only'],
            reviewers: argv.reviewers,
            confirm: argv.confirm,
            forcePush: argv.force,
            select: argv.select,
        }, context);
    });
};
exports.handler = handler;
//# sourceMappingURL=submit.js.map