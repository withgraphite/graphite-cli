"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.description = exports.canonical = exports.command = void 0;
const runner_1 = require("../../lib/runner");
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
const handler = async (argv) => {
    return (0, runner_1.graphite)(argv, exports.canonical, async (context) => {
        if (argv.set) {
            context.repoConfig.setRemote(argv.set);
        }
        else {
            context.splog.info(context.repoConfig.getRemote());
        }
    });
};
exports.handler = handler;
//# sourceMappingURL=repo_remote.js.map