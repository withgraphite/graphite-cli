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
exports.handler = exports.aliases = exports.builder = exports.description = exports.canonical = exports.command = void 0;
const fix_1 = require("../../actions/fix");
const errors_1 = require("../../lib/errors");
const telemetry_1 = require("../../lib/telemetry");
exports.command = "fix";
exports.canonical = "stack fix";
exports.description = "Fix your stack of changes, either by recursively rebasing branches onto their parents, or by regenerating Graphite's stack metadata from the branch relationships in the git commit tree.";
const args = {
    rebase: {
        describe: `Fix your stack by recursively rebasing branches onto their parents, as recorded in Graphite's stack metadata.`,
        demandOption: false,
        default: false,
        type: "boolean",
    },
    regen: {
        describe: `Regenerate Graphite's stack metadata from the branch relationships in the git commit tree, overwriting the previous Graphite stack metadata.`,
        demandOption: false,
        default: false,
        type: "boolean",
    },
};
exports.builder = args;
exports.aliases = ["f"];
const handler = (argv) => __awaiter(void 0, void 0, void 0, function* () {
    return telemetry_1.profile(argv, exports.canonical, () => __awaiter(void 0, void 0, void 0, function* () {
        if (argv.rebase && argv.regen) {
            throw new errors_1.ExitFailedError('Please specify either the "--rebase" or "--regen" method, not both');
        }
        yield fix_1.fixAction({
            action: argv.rebase ? "rebase" : argv.regen ? "regen" : undefined,
            mergeConflictCallstack: "TOP_OF_CALLSTACK_WITH_NOTHING_AFTER",
        });
    }));
});
exports.handler = handler;
//# sourceMappingURL=fix.js.map