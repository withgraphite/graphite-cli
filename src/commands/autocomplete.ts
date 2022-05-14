import yargs, { Arguments } from 'yargs';
import { initContext } from '../lib/context';
import { Branch } from '../wrapper-classes/branch';

yargs.completion('completion', (current, argv) => {
  const context = initContext();
  const branchArg = getBranchArg(current, argv);
  if (branchArg === null) {
    return;
  }

  return Branch.allBranches(context, {
    filter: (b) => b.name.startsWith(branchArg),
  })
    .map((b) => b.name)
    .sort();
});

/**
 * If the user is entering a branch argument, returns the current entered
 * value. Else, returns null.
 *
 * e.g.
 *
 * gt branch checkout --branch ny--xyz => 'ny--xyz'
 * gt branch checkout --branch => ''
 *
 * gt repo sync => null
 * gt log => null
 */
function getBranchArg(current: string, argv: Arguments): string | null {
  if (
    // gt bco
    // Check membership in argv to ensure that "bco" is its own entry (and not
    // a substring of another command). Since we're dealing with a positional,
    // we also want to make sure that the current argument is the positional
    // (position 3).
    ((argv['_'].length <= 3 &&
      (argv['_'][1] === 'bco' || argv['_'][1] === 'bdl')) ||
      // gt branch checkout/delete (and permutations)
      // same as above, but one position further
      (argv['_'].length <= 4 &&
        (argv['_'][1] === 'b' || argv['_'][1] === 'branch') &&
        (argv['_'][2] === 'co' ||
          argv['_'][2] === 'checkout' ||
          argv['_'][2] === 'dl' ||
          argv['_'][2] === 'delete')) ||
      // gt upstack onto / us onto
      ((argv['_'][1] === 'upstack' || argv['_'][1] === 'us') &&
        argv['_'][2] === 'onto')) &&
    typeof current === 'string'
  ) {
    // this handles both with and without --branch because it's the only string arg
    return current;
  }

  return null;
}
