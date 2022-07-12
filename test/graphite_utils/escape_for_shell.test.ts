import { expect } from 'chai';
import { execSync } from 'child_process';
import { q } from '../../src/lib/utils/escape_for_shell';

describe('shell escaping', function () {
  for (const s of [
    'HELLO',
    'Hello, world!',
    "'''\"\"\"'''",
    '\\/|$*&(*&^#$',
    [...Array(256).keys()]
      .slice(32)
      .map((n) => String.fromCharCode(n))
      .join(''),
  ]) {
    it('outputs its input when passed through echo', async () => {
      expect(execSync(`echo ${q(s)}`, { encoding: 'utf-8' })).to.equal(
        `${s}\n`
      );
    });
  }
});
