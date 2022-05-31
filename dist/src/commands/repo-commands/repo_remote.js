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
const args = {
    set: {
        optional: false,
        type: 'string',
        alias: 's',
        describe: "Override the name of the remote repository. Only set this if you are using a remote other than 'origin'.",
    },
};
exports.command = 'remote';
exports.canonical = 'repo remote';
exports.description = "Specifies the remote that graphite pushes to/pulls from (defaults to 'origin')";
exports.builder = args;
const handler = (argv) => __awaiter(void 0, void 0, void 0, function* () {
    return profile_1.profile(argv, exports.canonical, (context) => __awaiter(void 0, void 0, void 0, function* () {
        if (argv.set) {
            context.repoConfig.setRemote(argv.set);
        }
        else {
            context.splog.logInfo(context.repoConfig.getRemote());
        }
    }));
});
exports.handler = handler;
//# sourceMappingURL=repo_remote.js.map