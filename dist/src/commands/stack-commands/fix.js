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
const fix_1 = require("../../actions/fix");
const errors_1 = require("../../lib/errors");
const telemetry_1 = require("../../lib/telemetry");
var fix_2 = require("../shared-commands/fix");
Object.defineProperty(exports, "aliases", { enumerable: true, get: function () { return fix_2.aliases; } });
Object.defineProperty(exports, "args", { enumerable: true, get: function () { return fix_2.args; } });
Object.defineProperty(exports, "builder", { enumerable: true, get: function () { return fix_2.builder; } });
Object.defineProperty(exports, "command", { enumerable: true, get: function () { return fix_2.command; } });
exports.canonical = 'stack fix';
exports.description = "Fix your stack of changes, either by recursively rebasing branches onto their parents, or by regenerating Graphite's stack metadata from the branch relationships in the git commit tree.";
const handler = (argv) => __awaiter(void 0, void 0, void 0, function* () {
    return telemetry_1.profile(argv, exports.canonical, (context) => __awaiter(void 0, void 0, void 0, function* () {
        if (argv.rebase && argv.regen) {
            throw new errors_1.ExitFailedError('Please specify either the "--rebase" or "--regen" method, not both');
        }
        yield fix_1.fixAction({
            action: argv.rebase ? 'rebase' : argv.regen ? 'regen' : undefined,
            mergeConflictCallstack: [],
            scope: 'stack',
        }, context);
    }));
});
exports.handler = handler;
//# sourceMappingURL=fix.js.map