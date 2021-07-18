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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const tmp_1 = __importDefault(require("tmp"));
const git_repo_1 = __importDefault(require("../../../test/utils/git_repo"));
const abstract_command_1 = __importDefault(require("../abstract_command"));
const args = {};
class DemoCommand extends abstract_command_1.default {
    _execute(argv) {
        return __awaiter(this, void 0, void 0, function* () {
            const tmpDir = tmp_1.default.dirSync();
            console.log(tmpDir.name);
            const repo = new git_repo_1.default(tmpDir.name);
            repo.createChangeAndCommit("First commit");
            repo.createChangeAndCommit("Second commit");
            repo.createChange("[Product] Add review queue filter api");
            execCliCommand("diff -b 'tr--review_queue_api' -m '[Product] Add review queue filter api'", { fromDir: tmpDir.name });
            repo.createChange("[Product] Add review queue filter server");
            execCliCommand("diff -b 'tr--review_queue_server' -m '[Product] Add review queue filter server'", { fromDir: tmpDir.name });
            repo.createChange("[Product] Add review queue filter frontend");
            execCliCommand("diff -b 'tr--review_queue_frontend' -m '[Product] Add review queue filter frontend'", { fromDir: tmpDir.name });
            repo.checkoutBranch("main");
            repo.createChange("[Bug Fix] Fix crashes on reload");
            execCliCommand("diff -b 'tr--fix_crash_on_reload' -m '[Bug Fix] Fix crashes on reload'", { fromDir: tmpDir.name });
            repo.checkoutBranch("main");
            repo.createChange("[Bug Fix] Account for empty state");
            execCliCommand("diff -b 'tr--account_for_empty_state' -m '[Bug Fix] Account for empty state'", { fromDir: tmpDir.name });
            repo.checkoutBranch("main");
        });
    }
}
exports.default = DemoCommand;
DemoCommand.args = args;
function execCliCommand(command, opts) {
    child_process_1.execSync(`sd ${command}`, {
        stdio: "inherit",
        cwd: opts.fromDir,
    });
}
//# sourceMappingURL=index.js.map