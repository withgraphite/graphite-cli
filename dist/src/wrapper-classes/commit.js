"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Commit = void 0;
const exec_sync_1 = require("../lib/utils/exec_sync");
class Commit {
    constructor(sha) {
        if (sha.length != 40) {
            throw new Error(`Commit sha must be 40 characters long. Attempted sha = "${sha}"`);
        }
        this.sha = sha;
    }
    parents() {
        return exec_sync_1.gpExecSync({
            command: `git rev-parse ${this.sha}`,
        })
            .split('\n')
            .map((parentSha) => new Commit(parentSha));
    }
    messageImpl(format) {
        return exec_sync_1.gpExecSync({
            command: `git log --format=%${format} -n 1 ${this.sha} --`,
        });
    }
    messageRaw() {
        return this.messageImpl('B');
    }
    messageSubject() {
        return this.messageImpl('s');
    }
    messageBody() {
        return this.messageImpl('b');
    }
}
exports.Commit = Commit;
//# sourceMappingURL=commit.js.map