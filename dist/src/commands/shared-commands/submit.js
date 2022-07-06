"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aliases = exports.builder = exports.args = exports.command = void 0;
exports.command = 'submit';
/**
 * Primary interaction patterns:
 *
 * # (default) allows user to edit PR fields inline and then submits stack as a draft
 * gt stack submit
 *
 * # skips editing PR fields inline, submits stack as a draft
 * gt stack submit --no-edit
 *
 * # allows user to edit PR fields inline, then opens as draft
 * gt stack submit --draft
 *
 * # allows user to edit PR fields inline, then publishes
 * gt stack submit --publish
 *
 * # same as gt stack submit --no-edit
 * gt stack submit --no-interactive
 *
 */
exports.args = {
    draft: {
        describe: 'If set, marks PR as draft. If --no-interactive is true, new PRs will be created in draft mode.',
        type: 'boolean',
        default: false,
        alias: 'd',
    },
    publish: {
        describe: 'If set, publishes PR. If --no-interactive is true, new PRs will be created in draft mode.',
        type: 'boolean',
        default: false,
        alias: 'p',
    },
    edit: {
        describe: 'Edit PR fields inline. If --no-interactive is true, this is automatically set to false.',
        type: 'boolean',
        default: true,
        alias: 'e',
    },
    reviewers: {
        describe: 'Prompt to manually set reviewers if true',
        type: 'boolean',
        default: false,
        alias: 'r',
    },
    'dry-run': {
        describe: 'Reports the PRs that would be submitted and terminates. No branches are pushed and no PRs are opened or updated.',
        type: 'boolean',
        default: false,
    },
    confirm: {
        describe: 'Reports the PRs that would be submitted and asks for confirmation before pushing branches and opening/updating PRs. If either of --no-interactive or --dry-run is passed, this flag is ignored.',
        type: 'boolean',
        default: false,
        alias: 'c',
    },
    'update-only': {
        describe: 'Only update the PRs that have been already been submitted.',
        type: 'boolean',
        default: false,
        alias: 'u',
    },
};
exports.builder = exports.args;
exports.aliases = ['s'];
//# sourceMappingURL=submit.js.map