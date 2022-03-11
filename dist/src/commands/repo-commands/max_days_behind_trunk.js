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
exports.handler = exports.builder = exports.description = exports.canonical = exports.command = void 0;
const telemetry_1 = require("../../lib/telemetry");
const utils_1 = require("../../lib/utils");
const args = {
    set: {
        optional: true,
        type: 'number',
        alias: 's',
        describe: 'Override the max age of branches (behind trunk) Graphite will track.',
    },
};
exports.command = 'max-days-behind-trunk';
exports.canonical = 'repo max-days-behind-trunk';
exports.description = 'Graphite will track branches that lag up to this many days behind trunk. e.g. If this is set to 90, Graphite log/Graphite stacks commands will show all stacks up to 90 days behind trunk.';
exports.builder = args;
const handler = (argv) => __awaiter(void 0, void 0, void 0, function* () {
    return telemetry_1.profile(argv, exports.canonical, (context) => __awaiter(void 0, void 0, void 0, function* () {
        if (argv.set) {
            context.repoConfig.update((data) => (data.maxDaysShownBehindTrunk = argv.set));
        }
        else {
            utils_1.logInfo(context.repoConfig.getMaxDaysShownBehindTrunk().toString());
        }
    }));
});
exports.handler = handler;
//# sourceMappingURL=max_days_behind_trunk.js.map