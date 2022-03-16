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
exports.handler = exports.builder = exports.description = exports.aliases = exports.canonical = exports.command = void 0;
const child_process_1 = require("child_process");
const preconditions_1 = require("../../lib/preconditions");
const telemetry_1 = require("../../lib/telemetry");
const utils_1 = require("../../lib/utils");
const git_repo_1 = require("../../lib/utils/git_repo");
exports.command = 'create-stack';
exports.canonical = 'create-stack';
exports.aliases = ['cs'];
exports.description = false;
const args = {};
exports.builder = args;
const handler = (argv) => __awaiter(void 0, void 0, void 0, function* () {
    return telemetry_1.profile(argv, exports.canonical, () => __awaiter(void 0, void 0, void 0, function* () {
        const repoPath = preconditions_1.currentGitRepoPrecondition();
        const repo = new git_repo_1.GitRepo(repoPath, {
            existingRepo: true,
        });
        const id = utils_1.makeId(4);
        repo.createChange('[1/3] Add review queue filter api');
        execCliCommand(`branch create '${id}--a' -m '[Product] Add review queue filter api'`);
        repo.createChange('[2/3] Add review queue filter server');
        execCliCommand(`branch create '${id}--b' -m '[Product] Add review queue filter server'`);
        repo.createChange('[3/3] Add review queue filter frontend');
        execCliCommand(`branch create '${id}--c' -m '[Product] Add review queue filter frontend'`);
    }));
});
exports.handler = handler;
function execCliCommand(command) {
    child_process_1.execSync(`gt ${command}`, {
        stdio: 'inherit',
    });
}
//# sourceMappingURL=stack.js.map