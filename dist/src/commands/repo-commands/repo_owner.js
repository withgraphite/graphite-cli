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
const profile_1 = require("../../lib/telemetry/profile");
const splog_1 = require("../../lib/utils/splog");
const args = {
    set: {
        optional: false,
        type: 'string',
        alias: 's',
        describe: "Override the value of the repo owner's name in the Graphite config. This is expected to match the name of the repo owner on GitHub and should only be set in cases where Graphite is incorrectly inferring the repo owner's name.",
    },
};
exports.command = 'owner';
exports.canonical = 'repo owner';
exports.description = "The current repo owner's name stored in Graphite. e.g. in 'withgraphite/graphite-cli', this is 'withgraphite'.";
exports.builder = args;
const handler = (argv) => __awaiter(void 0, void 0, void 0, function* () {
    return profile_1.profile(argv, exports.canonical, (context) => __awaiter(void 0, void 0, void 0, function* () {
        if (argv.set) {
            context.repoConfig.update((data) => (data.owner = argv.set));
        }
        else {
            splog_1.logInfo(context.repoConfig.getRepoOwner());
        }
    }));
});
exports.handler = handler;
//# sourceMappingURL=repo_owner.js.map