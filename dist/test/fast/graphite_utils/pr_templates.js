"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const basic_scene_1 = require("../../lib/scenes/basic_scene");
const configure_test_1 = require("../../lib/utils/configure_test");
for (const scene of [new basic_scene_1.BasicScene()]) {
    describe(`(${scene}): find all PR templates`, function () {
        configure_test_1.configureTest(this, scene);
        it('Can find single PR templates', () => {
            testPRTemplates({
                templatePaths: [
                    'pull_request_template.md',
                    '.github/pull_request_template.md',
                    'docs/pull_request_template.md',
                ],
            }, scene);
        });
        it('Can find all templates in PR template folders', () => {
            testPRTemplates({
                templatePaths: [
                    'PULL_REQUEST_TEMPLATE/a.md',
                    'PULL_REQUEST_TEMPLATE/b.md',
                    'PULL_REQUEST_TEMPLATE/c.md',
                    '.github/PULL_REQUEST_TEMPLATE/a.md',
                    '.github/PULL_REQUEST_TEMPLATE/b.md',
                    '.github/PULL_REQUEST_TEMPLATE/c.md',
                    'docs/PULL_REQUEST_TEMPLATE/a.md',
                    'docs/PULL_REQUEST_TEMPLATE/b.md',
                    'docs/PULL_REQUEST_TEMPLATE/c.md',
                ],
            }, scene);
        });
        it('Searches for PR templates, case-insensitive', () => {
            testPRTemplates({ templatePaths: ['pull_Request_Template.md'] }, scene);
        });
        it('Only finds .md and .txt as PR templates', () => {
            testPRTemplates({
                templatePaths: [
                    'pull_request_template.txt',
                    '.github/pull_request_template.md',
                ],
                nonTemplatePaths: ['docs/pull_request_template.doc'],
            }, scene);
        });
    });
}
function testPRTemplates(args, scene) {
    var _a, _b;
    args.templatePaths.forEach((template) => createFile(path_1.default.join(scene.repo.dir, template)));
    (_a = args.nonTemplatePaths) === null || _a === void 0 ? void 0 : _a.forEach((nonTemplate) => createFile(path_1.default.join(scene.repo.dir, nonTemplate)));
    const foundPRTemplates = scene.repo.execCliCommandAndGetOutput('repo pr-templates');
    args.templatePaths.forEach((template) => chai_1.expect(foundPRTemplates.includes(template)).to.be.true);
    (_b = args.nonTemplatePaths) === null || _b === void 0 ? void 0 : _b.forEach((nonTemplate) => chai_1.expect(foundPRTemplates.includes(nonTemplate)).to.be.false);
}
function createFile(filepath) {
    const parsedPath = path_1.default.parse(filepath);
    const dirs = parsedPath.dir.split('/');
    let writtenFilePath = '';
    dirs.forEach((part) => {
        writtenFilePath += `${part}/`;
        if (!fs_extra_1.default.existsSync(writtenFilePath)) {
            fs_extra_1.default.mkdirSync(writtenFilePath);
        }
    });
    fs_extra_1.default.writeFileSync(filepath, 'test');
}
//# sourceMappingURL=pr_templates.js.map