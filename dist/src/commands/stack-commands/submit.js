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
exports.handler = exports.description = exports.canonical = exports.command = exports.builder = exports.args = exports.aliases = void 0;
const submit_1 = require("../../actions/submit/submit");
const telemetry_1 = require("../../lib/telemetry");
var submit_2 = require("../shared-commands/submit");
Object.defineProperty(exports, "aliases", { enumerable: true, get: function () { return submit_2.aliases; } });
Object.defineProperty(exports, "args", { enumerable: true, get: function () { return submit_2.args; } });
Object.defineProperty(exports, "builder", { enumerable: true, get: function () { return submit_2.builder; } });
Object.defineProperty(exports, "command", { enumerable: true, get: function () { return submit_2.command; } });
exports.canonical = 'stack submit';
exports.description = 'Idempotently force push all branches in the current stack to GitHub, creating or updating distinct pull requests for each.';
const handler = (argv) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, telemetry_1.profile)(argv, exports.canonical, () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, submit_1.submitAction)({
            scope: 'FULLSTACK',
            editPRFieldsInline: argv.edit,
            createNewPRsAsDraft: argv.draft,
            dryRun: argv['dry-run'],
            updateOnly: argv['update-only'],
            reviewers: argv.reviewers,
        });
    }));
});
exports.handler = handler;
//# sourceMappingURL=submit.js.map