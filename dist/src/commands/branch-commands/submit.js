"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.canonical = exports.description = exports.command = exports.builder = exports.args = exports.aliases = void 0;
const submit_1 = require("../../actions/submit/submit");
const telemetry_1 = require("../../lib/telemetry");
const utils_1 = require("../../lib/utils");
var submit_2 = require("../shared-commands/submit");
Object.defineProperty(exports, "aliases", { enumerable: true, get: function () { return submit_2.aliases; } });
Object.defineProperty(exports, "args", { enumerable: true, get: function () { return submit_2.args; } });
Object.defineProperty(exports, "builder", { enumerable: true, get: function () { return submit_2.builder; } });
Object.defineProperty(exports, "command", { enumerable: true, get: function () { return submit_2.command; } });
exports.description = 'Idempotently force push the current branch to GitHub, creating or updating a pull request.';
exports.canonical = 'branch submit';
const handler = (argv) => __awaiter(void 0, void 0, void 0, function* () {
    yield telemetry_1.profile(argv, exports.canonical, (context) => __awaiter(void 0, void 0, void 0, function* () {
        yield submit_1.submitAction({
            scope: 'BRANCH',
            editPRFieldsInline: argv.edit,
            draftToggle: argv.draft,
            dryRun: argv['dry-run'],
            updateOnly: argv['update-only'],
            reviewers: argv.reviewers,
        }, context);
        utils_1.logTip([
            `You submitted a pull request for a specific branch.`,
            `In common cases, we recommend you use:`,
            `* 'gt stack submit'`,
            `* 'gt downstack submit'`,
            `because these will ensure any downstack changes will be synced to existing PRs.`,
        ].join('\n'), context);
    }));
});
exports.handler = handler;
//# sourceMappingURL=submit.js.map