"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.description = exports.canonical = exports.command = void 0;
const runner_1 = require("../../lib/runner");
const args = {
    set: {
        optional: true,
        type: 'string',
        alias: 's',
        describe: "Override the value of the repo's name in the Graphite config. This is expected to match the name of the repo on GitHub and should only be set in cases where Graphite is incorrectly inferring the repo name.",
    },
};
exports.command = 'name';
exports.canonical = 'repo name';
exports.description = "The current repo's name stored in Graphite. e.g. in 'withgraphite/graphite-cli', this is 'graphite-cli'.";
exports.builder = args;
const handler = async (argv) => {
    return (0, runner_1.graphite)(argv, exports.canonical, async (context) => {
        if (argv.set) {
            context.repoConfig.update((data) => (data.name = argv.set));
        }
        else {
            context.splog.info(context.repoConfig.getRepoName());
        }
    });
};
exports.handler = handler;
//# sourceMappingURL=repo_name.js.map