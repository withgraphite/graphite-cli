"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../src/lib/utils");
const abstract_demo_1 = __importDefault(require("./abstract_demo"));
class FullDemo extends abstract_demo_1.default {
    constructor() {
        super("full", [
            "# First, lets see our state of the world",
            "gt stacks",
            "# Now imagine we created our first stacked branch without graphite",
            'echo "new change" > ./server_change',
            "git checkout -b gf--server && git add . && git commit -m 'PROGRESS!'",
            "# Let's visualize our stacks",
            "gt stacks",
            "# If we forget to use graphite, we can regenerate our stacks retroactively",
            "git checkout main && gt stack regen",
            "gt stacks",
            "# Using graphite, we can create new stacked branches without `regen`",
            'git checkout gf--server && echo "second change" > ./api_change && git add .',
            "gt branch create 'gf--api' -m 'feat(api): improve it'",
            "# Let's visualize the extended stack",
            "gt stacks",
            "# What if our trunk branch moves forward one commit?",
            "git checkout main",
            "echo 'change' > ./main_change",
            "git add . && git commit -m 'OTHER'",
            "# Graphite recursively rebases depedent branches up the stack",
            "gt stack fix",
            "# Thanks for watching",
            "# Good luck and let us know if you have questions!",
            "sleep 5",
        ], (demoDir) => {
            const repo = new utils_1.GitRepo(demoDir);
            repo.createChangeAndCommit("First commit");
            repo.createChangeAndCommit("Second commit");
        });
    }
}
exports.default = FullDemo;
//# sourceMappingURL=full_demo.js.map