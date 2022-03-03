"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshPRInfoInBackground = void 0;
const child_process_1 = __importDefault(require("child_process"));
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
//# sourceMappingURL=fetch_pr_info.js.map