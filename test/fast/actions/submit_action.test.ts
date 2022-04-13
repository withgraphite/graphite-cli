import { expect } from 'chai';
import { execSync } from 'child_process';
import { inferPRBody, inferPRTitle } from '../../../src/actions/submit';
import { detectEmptyBranches } from '../../../src/actions/submit/submit';
import { execStateConfig } from '../../../src/lib/config/exec_state_config';
import { Branch } from '../../../src/wrapper-classes/branch';
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

      const branch = await Branch.branchWithName('a', scene.context);

      expect(inferPRTitle(branch, scene.context)).to.equals(title);
      expect(inferPRBody(branch, scene.context)).to.equals(body);
    });

    it('can infer just title with no body', async () => {
      const title = 'Test Title';
      const commitMessage = title;

      scene.repo.createChange('a');
      scene.repo.execCliCommand(`branch create "a" -m "${commitMessage}" -q`);

      const branch = await Branch.branchWithName('a', scene.context);
      expect(inferPRTitle(branch, scene.context)).to.equals(title);
      expect(inferPRBody(branch, scene.context)).to.be.null;
    });

    it('does not infer title/body for multiple commits', async () => {
      const title = 'Test Title';
      const commitMessage = title;

      scene.repo.createChange('a');
      scene.repo.execCliCommand(`branch create "a" -m "${commitMessage}" -q`);
      scene.repo.createChangeAndCommit(commitMessage);

      const branch = await Branch.branchWithName('a', scene.context);
      expect(inferPRTitle(branch, scene.context)).to.not.equals(title);
      expect(inferPRBody(branch, scene.context)).to.be.null;
    });

    it('aborts if the branch is empty', async () => {
      execStateConfig._data.interactive = false;
      scene.repo.execCliCommand(`branch create "a" -m "a" -q`);
      const branch = await Branch.branchWithName('a', scene.context);
      expect(await detectEmptyBranches([branch], scene.context)).to.equals(
        'ABORT'
      );
    });

    it('does not abort if the branch is not empty', async () => {
      execStateConfig._data.interactive = false;
      scene.repo.createChange('a');
      scene.repo.execCliCommand(`branch create "a" -m "a" -q`);
      const branch = await Branch.branchWithName('a', scene.context);
      expect(await detectEmptyBranches([branch], scene.context)).to.equals(
        'SUCCESS'
      );
    });
  });
}
