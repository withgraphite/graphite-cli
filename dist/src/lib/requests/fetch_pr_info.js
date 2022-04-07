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
exports.refreshPRInfoInBackground = void 0;
const child_process_1 = __importDefault(require("child_process"));
const branch_1 = require("../../wrapper-classes/branch");
const pr_info_1 = require("../sync/pr_info");
const context_1 = require("./../context/context");
function refreshPRInfoInBackground(context) {
    if (!context.repoConfig.graphiteInitialized()) {
        return;
    }
    const now = Date.now();
    const lastFetchedMs = context.repoConfig.data.lastFetchedPRInfoMs;
    const msInSecond = 1000;
    // rate limit refreshing PR info to once per minute
    if (lastFetchedMs === undefined || now - lastFetchedMs > 60 * msInSecond) {
        // do our potential write before we kick off the child process so that we
        // don't incur a possible race condition with the write
        context.repoConfig.update((data) => (data.lastFetchedPRInfoMs = now));
        child_process_1.default.spawn('/usr/bin/env', ['node', __filename], {
            detached: true,
            stdio: 'ignore',
        });
    }
}
exports.refreshPRInfoInBackground = refreshPRInfoInBackground;
function refreshPRInfo(context) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const branchesWithPRInfo = branch_1.Branch.allBranches(context).filter((branch) => branch.getPRInfo() !== undefined);
            yield pr_info_1.syncPRInfoForBranches(branchesWithPRInfo, context);
        }
        catch (err) {
            return;
        }
    });
}
if (process.argv[1] === __filename) {
    void refreshPRInfo(context_1.initContext());
}
//# sourceMappingURL=fetch_pr_info.js.map