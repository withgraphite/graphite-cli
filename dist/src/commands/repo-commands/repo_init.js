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
const init_1 = require("../../actions/init");
const telemetry_1 = require("../../lib/telemetry");
const args = {
    trunk: {
        describe: `The name of your trunk branch.`,
        demandOption: false,
        optional: true,
        type: 'string',
    },
    'ignore-branches': {
        describe: `A list of branches that Graphite should ignore when tracking your stacks (i.e. branches you never intend to merge into trunk).`,
        demandOption: false,
        optional: true,
        type: 'string',
        array: true,
    },
};
exports.command = 'init';
exports.canonical = 'repo init';
exports.description = 'Create or regenerate a `.graphite_repo_config` file.';
exports.builder = args;
const handler = (argv) => __awaiter(void 0, void 0, void 0, function* () {
    return (0, telemetry_1.profile)(argv, exports.canonical, () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, init_1.init)(argv.trunk, argv['ignore-branches']);
    }));
});
exports.handler = handler;
//# sourceMappingURL=repo_init.js.map