"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.description = exports.canonical = exports.command = void 0;
const runner_1 = require("../../lib/runner");
const pr_templates_1 = require("../../lib/utils/pr_templates");
const args = {};
exports.command = 'pr-templates';
exports.canonical = 'repo pr-templates';
exports.description = 'A list of your GitHub PR templates. These are used to pre-fill the bodies of your PRs created using the submit command.';
exports.builder = args;
const handler = async (argv) => {
    return (0, runner_1.graphite)(argv, exports.canonical, async (context) => {
        context.splog.info((0, pr_templates_1.getPRTemplateFilepaths)().join('\n'));
    });
};
exports.handler = handler;
//# sourceMappingURL=repo_pr_templates.js.map