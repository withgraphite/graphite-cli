"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPRTemplateFilepaths = exports.getPRTemplate = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const prompts_1 = __importDefault(require("prompts"));
const errors_1 = require("../errors");
const preconditions_1 = require("../preconditions");
async function getPRTemplate() {
    const templateFiles = getPRTemplateFilepaths();
    if (templateFiles.length === 0) {
        return undefined;
    }
    return fs_extra_1.default
        .readFileSync(templateFiles.length === 1
        ? templateFiles[0]
        : (await (0, prompts_1.default)({
            type: 'select',
            name: 'templateFilepath',
            message: `Body Template`,
            choices: templateFiles.map((file) => {
                return {
                    title: getRelativePathFromRepo(file),
                    value: file,
                };
            }),
        }, {
            onCancel: () => {
                throw new errors_1.KilledError();
            },
        })).templateFilepath)
        .toString();
}
exports.getPRTemplate = getPRTemplate;
function getRelativePathFromRepo(path) {
    const repoPath = (0, preconditions_1.currentGitRepoPrecondition)();
    return path.replace(repoPath, '');
}
/**
 * Returns GitHub PR templates, following the order of precedence GitHub uses
 * when creating a new PR.
 *
 * Summary:
 * - All PR templates must be located in 1) the top-level repo directory 2)
 *   a .github/ directory or 3) a docs/ directory.
 * - GitHub allows you to define a single default PR template by naming it
 *   pull_request_template (case-insensitive) with either a .md or .txt
 *   file extension. If one of these is provided, GitHub autofills the body
 *   field on the PR creation page -- unless it is overridden with a template
 *   query param.
 * - If you have multiple PR templates, you can put them in a
 *   PULL_REQUEST_TEMPLATE directory in one of the PR locations above. However,
 *   at PR creation time, GitHub doesn't autofill the body field on the PR
 *   creation page unless you tell it which template to use via a (URL) query
 *   param.
 *
 * More Info:
 * - https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/about-issue-and-pull-request-templates
 * - https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/creating-a-pull-request-template-for-your-repository
 *
 */
function getPRTemplateFilepaths() {
    const repoPath = (0, preconditions_1.currentGitRepoPrecondition)();
    const prTemplateLocations = [
        repoPath,
        path_1.default.join(repoPath, '.github'),
        path_1.default.join(repoPath, 'docs'),
    ].filter((location) => fs_extra_1.default.existsSync(location));
    return prTemplateLocations
        .flatMap((location) => findSinglePRTemplate(location))
        .concat(prTemplateLocations.flatMap((location) => findMultiplePRTemplates(location)));
}
exports.getPRTemplateFilepaths = getPRTemplateFilepaths;
function findSinglePRTemplate(folderPath) {
    return fs_extra_1.default
        .readdirSync(folderPath, { withFileTypes: true })
        .filter((entry) => entry.isFile() &&
        entry.name.match(/^pull_request_template\./gi) !== null)
        .map((file) => path_1.default.join(folderPath, file.name));
}
function findMultiplePRTemplates(folderPath) {
    return fs_extra_1.default
        .readdirSync(folderPath, { withFileTypes: true })
        .filter((entry) => entry.isDirectory() &&
        entry.name.match(/^pull_request_template$/gi) !== null)
        .flatMap((entry) => fs_extra_1.default
        .readdirSync(path_1.default.join(folderPath, entry.name))
        .map((filename) => path_1.default.join(folderPath, entry.name, filename)));
}
//# sourceMappingURL=pr_templates.js.map