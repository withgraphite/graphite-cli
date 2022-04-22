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
exports.handler = exports.canonical = exports.builder = exports.description = exports.command = void 0;
const telemetry_1 = require("../lib/telemetry");
const utils_1 = require("../lib/utils");
const args = {
    token: {
        type: 'string',
        alias: 't',
        describe: 'Auth token.',
        demandOption: false,
    },
};
exports.command = 'auth';
exports.description = 'Add your auth token to enable Graphite CLI to create and update your PRs on GitHub. You can get your auth token here: https://app.graphite.dev/activate.';
exports.builder = args;
exports.canonical = 'auth';
const handler = (argv) => __awaiter(void 0, void 0, void 0, function* () {
    return telemetry_1.profile(argv, exports.canonical, (context) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        if (argv.token) {
            context.userConfig.update((data) => (data.authToken = argv.token));
            utils_1.logSuccess(`🔐 Saved auth token to "${context.userConfig.path}"`);
            return;
        }
        utils_1.logInfo((_a = context.userConfig.data.authToken) !== null && _a !== void 0 ? _a : 'No auth token set.');
    }));
});
exports.handler = handler;
//# sourceMappingURL=auth.js.map