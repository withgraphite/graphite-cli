import { expect } from 'chai';
import { execSync } from 'child_process';
import { inferPRBody, inferPRTitle } from '../../../src/actions/submit';
import Branch from '../../../src/wrapper-classes/branch';
import { BasicScene } from '../../lib/scenes';
import { configureTest } from '../../lib/utils';

for (const scene of [new BasicScene()]) {
  describe(`(${scene}): correctly infers submit info from commits`, function () {
    configureTest(this, scene);

    it('can infer title/body from single commit', async () => {
      const title = 'Test Title';
      const body = ['Test body line 1.', 'Test body line 2.'].join('\n');

      scene.repo.execCliCommand(`branch create "a" -m "a" -q`);
      execSync(`git reset HEAD~1 --hard`);
      scene.repo.createChange('a');
      execSync(`git commit -m "${title}" -m "${body}"`);

      const branch = await Branch.branchWithName('a');

      expect(inferPRTitle(branch)).to.equals(title);
      expect(inferPRBody(branch)).to.equals(body);
    });

    it('can infer just title with no body', async () => {
      const title = 'Test Title';
      const commitMessage = title;

      scene.repo.createChange('a');
      scene.repo.execCliCommand(`branch create "a" -m "${commitMessage}" -q`);

      const branch = await Branch.branchWithName('a');
      expect(inferPRTitle(branch)).to.equals(title);
      expect(inferPRBody(branch)).to.be.null;
    });

    it('does not infer title/body for multiple commits', async () => {
      const title = 'Test Title';
      const commitMessage = title;

      scene.repo.createChange('a');
      scene.repo.execCliCommand(`branch create "a" -m "${commitMessage}" -q`);
      scene.repo.createChangeAndCommit(commitMessage);

      const branch = await Branch.branchWithName('a');
      expect(inferPRTitle(branch)).to.not.equals(title);
      expect(inferPRBody(branch)).to.be.null;
    });
  });
}
