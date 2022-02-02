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
exports.handler = exports.canonical = exports.aliases = exports.builder = exports.description = exports.command = void 0;
const log_short_1 = require("../../actions/log_short");
const telemetry_1 = require("../../lib/telemetry");
const args = {};
exports.command = 'short';
exports.description = 'Log all stacks tracked by Graphite.';
exports.builder = args;
exports.aliases = ['s'];
exports.canonical = 'log short';
const handler = (argv) => __awaiter(void 0, void 0, void 0, function* () {
    return telemetry_1.profile(argv, exports.canonical, () => __awaiter(void 0, void 0, void 0, function* () {
        yield log_short_1.logShortAction();
    }));
});
exports.handler = handler;
//# sourceMappingURL=short.js.map