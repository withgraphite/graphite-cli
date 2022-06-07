import { expect } from 'chai';
import { execSync } from 'child_process';
import { inferPRBody } from '../../../src/actions/submit/pr_body';
import { inferPRTitle } from '../../../src/actions/submit/pr_title';
import { checkForEmptyBranches } from '../../../src/actions/submit/validate_branches';
import { initContext } from '../../../src/lib/context';
import { Branch } from '../../../src/wrapper-classes/branch';
import { BasicScene } from '../../lib/scenes/basic_scene';
import { configureTest } from '../../lib/utils/configure_test';

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

      const branch = Branch.branchWithName('a');

      expect(inferPRTitle(branch, initContext())).to.equals(title);
      expect(inferPRBody(branch, initContext())).to.equals(body);
    });

    it('can infer just title with no body', async () => {
      const title = 'Test Title';
      const commitMessage = title;

      scene.repo.createChange('a');
      scene.repo.execCliCommand(`branch create "a" -m "${commitMessage}" -q`);

      const branch = Branch.branchWithName('a');
      expect(inferPRTitle(branch, initContext())).to.equals(title);
      expect(inferPRBody(branch, initContext())).to.be.undefined;
    });

    it('does not infer title/body for multiple commits', async () => {
      const title = 'Test Title';
      const commitMessage = title;

      scene.repo.createChange('a');
      scene.repo.execCliCommand(`branch create "a" -m "${commitMessage}" -q`);
      scene.repo.createChangeAndCommit(commitMessage);

      const branch = Branch.branchWithName('a');
      expect(inferPRTitle(branch, initContext())).to.not.equals(title);
      expect(inferPRBody(branch, initContext())).to.be.undefined;
    });

    it('aborts if the branch is empty', async () => {
      scene.repo.execCliCommand(`branch create "a" -m "a" -q`);
      const branch = Branch.branchWithName('a');
      expect(
        await checkForEmptyBranches(
          [branch],
          initContext({ globalArguments: { interactive: false } })
        )
      ).to.be.empty;
    });

    it('does not abort if the branch is not empty', async () => {
      scene.repo.createChange('a');
      scene.repo.execCliCommand(`branch create "a" -m "a" -q`);
      const branch = Branch.branchWithName('a');
      expect(
        (
          await checkForEmptyBranches(
            [branch],
            initContext({ globalArguments: { interactive: false } })
          )
        )[0].name
      ).to.equals('a');
    });
  });
}
