"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCommitRange = void 0;
const run_command_1 = require("../utils/run_command");
const FORMAT = {
    READABLE: '%h - %s',
    SUBJECT: '%s',
    MESSAGE: '%B%n',
    COMMITTER_DATE: '%cr',
    SHA: '%H',
};
function getCommitRange(base, head, format) {
    return base // if no base is passed in, just get one commit (e.g. trunk)
        ? (0, run_command_1.runGitCommandAndSplitLines)({
            args: [`--no-pager`, `log`, `--pretty=format:%H`, `${base}..${head}`],
            onError: 'throw',
            resource: 'getCommitRangeHashes',
        }).map((sha) => (0, run_command_1.runGitCommand)({
            args: [
                `--no-pager`,
                `log`,
                `-1`,
                `--pretty=format:${FORMAT[format]}`,
                sha,
            ],
            onError: 'throw',
            resource: 'getCommitRangeFormatted',
        }))
        : [
            (0, run_command_1.runGitCommand)({
                args: [
                    `--no-pager`,
                    `log`,
                    `-1`,
                    `--pretty=format:${FORMAT[format]}`,
                    head,
                ],
                onError: 'throw',
                resource: 'getCommitRangeFormatted',
            }),
        ];
}
exports.getCommitRange = getCommitRange;
//# sourceMappingURL=commit_range.js.map