"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
class Commit {
    constructor(sha) {
        if (sha.length != 40) {
            throw new Error(`Commit sha must be 40 characters long. Attempted sha = "${sha}"`);
        }
        this.sha = sha;
    }
    parents() {
        try {
            return child_process_1.execSync(`git rev-parse ${this.sha}`)
                .toString()
                .trim()
                .split("\n")
                .map((parentSha) => new Commit(parentSha));
        }
        catch (e) {
            return [];
        }
    }
    setParent(commit) {
        // execSync(`git rebase --onto ${commit.sha} ${this.sha} -Xtheirs`);
    }
}
exports.default = Commit;
//# sourceMappingURL=commit.js.map