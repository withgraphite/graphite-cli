"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aliases = exports.builder = exports.args = exports.command = void 0;
exports.command = "submit";
/**
 * Primary interaction patterns:
 *
 * # (default) allows user to edit PR fields inline and then submits stack as a draft
 * gt stack submit
 *
 * # skips editing PR fields inline, submits stack as a draft
 * gt stack submit --no-edit
 *
 * # allows user to edit PR fields inline, then publishes
 * gt stack submit --no-draft
 *
 * # same as gt stack submit --no-edit
 * gt stack submit --no-interactive
 *
 */
exports.args = {
    draft: {
        describe: "Creates new PRs in draft mode. If --no-interactive is true, this is automatically set to true.",
        type: "boolean",
        alias: "d",
    },
    edit: {
        describe: "Edit PR fields inline. If --no-interactive is true, this is automatically set to false.",
        type: "boolean",
        default: true,
        alias: "e",
    },
    "dry-run": {
        describe: "Reports the PRs that would be submitted and terminates. No branches are pushed and no PRs are opened or updated.",
        type: "boolean",
        default: false,
    },
};
exports.builder = exports.args;
exports.aliases = ["s"];
//# sourceMappingURL=submit.js.map