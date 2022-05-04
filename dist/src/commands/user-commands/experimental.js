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
exports.handler = exports.builder = exports.canonical = exports.description = exports.command = void 0;
const telemetry_1 = require("../../lib/telemetry");
const utils_1 = require("../../lib/utils");
const args = {
    enable: {
        demandOption: false,
        default: false,
        type: 'boolean',
        describe: 'Enable experimental features.',
    },
    disable: {
        demandOption: false,
        default: false,
        type: 'boolean',
        describe: 'Disable experimental features.',
    },
};
exports.command = 'experimental';
exports.description = 'Enable/disable experimental features';
exports.canonical = 'user experimental';
exports.builder = args;
const handler = (argv) => __awaiter(void 0, void 0, void 0, function* () {
    return telemetry_1.profile(argv, exports.canonical, (context) => __awaiter(void 0, void 0, void 0, function* () {
        if (argv.enable) {
            context.userConfig.update((data) => (data.experimental = true));
            utils_1.logInfo(`experimental features enabled`);
        }
        else if (argv.disable) {
            context.userConfig.update((data) => (data.experimental = false));
            utils_1.logInfo(`experimental features disabled`);
        }
        else {
            context.userConfig.data.experimental
                ? utils_1.logInfo(`experimental features enabled`)
                : utils_1.logInfo(`experimental features disabled`);
        }
    }));
});
exports.handler = handler;
//# sourceMappingURL=experimental.js.map