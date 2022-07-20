"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.canonical = exports.description = exports.command = void 0;
const runner_1 = require("../../lib/runner");
const args = {
    ['use-author-date']: {
        demandOption: false,
        type: 'boolean',
        describe: [
            'Passes `--committer-date-is-author-date` to the internal git rebase for restack operations.',
            'Instead of using the current time as the committer date, use the author date of the commit being rebased as the committer date.',
            'To return to default behavior, pass in `--no-use-author-date`',
        ].join('\n'),
    },
};
exports.command = 'restack-date';
exports.description = 'Configure how committer date is handled by restack internal rebases.';
exports.canonical = 'user restack-date';
exports.builder = args;
const handler = async (argv) => {
    return (0, runner_1.graphiteWithoutRepo)(argv, exports.canonical, async (context) => {
        if (typeof argv['use-author-date'] === undefined) {
            context.splog.info(`\`--committer-date-is-author-date\` will ${context.userConfig.data.restackCommitterDateIsAuthorDate ? '' : 'not '}be passed to the internal \`git rebase\``);
        }
        else if (argv['use-author-date']) {
            context.userConfig.update((data) => (data.restackCommitterDateIsAuthorDate = true));
            context.splog.info('`--committer-date-is-author-date` will be passed to the internal `git rebase`');
        }
        else {
            context.userConfig.update((data) => (data.restackCommitterDateIsAuthorDate = false));
            context.splog.info('`--committer-date-is-author-date` will not be passed to the internal `git rebase`');
        }
    });
};
exports.handler = handler;
//# sourceMappingURL=restack_date.js.map