import { expect } from 'chai';
import fs from 'fs-extra';
import path from 'path';
import { BasicScene } from '../lib/scenes/basic_scene';
import { configureTest } from '../lib/utils/configure_test';

for (const scene of [new BasicScene()]) {
  describe(`(${scene}): find all PR templates`, function () {
    configureTest(this, scene);

    it('Can find single PR templates', () => {
      testPRTemplates(
        {
          templatePaths: [
            'pull_request_template.md',
            '.github/pull_request_template.md',
            'docs/pull_request_template.md',
          ],
        },
        scene
      );
    });

    it('Can find all templates in PR template folders', () => {
      testPRTemplates(
        {
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
        },
        scene
      );
    });

    it('Searches for PR templates, case-insensitive', () => {
      testPRTemplates({ templatePaths: ['pull_Request_Template.md'] }, scene);
    });

    it('Only finds .md and .txt as PR templates', () => {
      testPRTemplates(
        {
          templatePaths: [
            'pull_request_template.txt',
            '.github/pull_request_template.md',
          ],
          nonTemplatePaths: ['docs/pull_request_template.doc'],
        },
        scene
      );
    });
  });
}
function testPRTemplates(
  args: {
    templatePaths: string[];
    nonTemplatePaths?: string[];
  },
  scene: BasicScene
) {
  args.templatePaths.forEach((template) =>
    createFile(path.join(scene.repo.dir, template))
  );
  args.nonTemplatePaths?.forEach((nonTemplate) =>
    createFile(path.join(scene.repo.dir, nonTemplate))
  );

  const foundPRTemplates =
    scene.repo.execCliCommandAndGetOutput('repo pr-templates');
  args.templatePaths.forEach(
    (template) => expect(foundPRTemplates.includes(template)).to.be.true
  );
  args.nonTemplatePaths?.forEach(
    (nonTemplate) => expect(foundPRTemplates.includes(nonTemplate)).to.be.false
  );
}

function createFile(filepath: string) {
  const parsedPath = path.parse(filepath);
  const dirs = parsedPath.dir.split('/');

  let writtenFilePath = '';
  dirs.forEach((part) => {
    writtenFilePath += `${part}/`;
    if (!fs.existsSync(writtenFilePath)) {
      fs.mkdirSync(writtenFilePath);
    }
  });

  fs.writeFileSync(filepath, 'test');
}
