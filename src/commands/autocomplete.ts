import yargs, { Arguments } from 'yargs';
import { initContext } from '../lib/context/context';
import Branch from '../wrapper-classes/branch';

yargs.completion('completion', (current, argv) => {
  const context = initContext();
  const branchArg = getBranchArg(current, argv);
  if (branchArg === null) {
    return;
  }

  return Branch.allBranchesWithFilter(
    {
      filter: (b) => b.name.startsWith(branchArg),
    },
    context
  )
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
  const currentCommand = argv['_'].join(' ');

  // gt branch checkout --branch <branch_name>
  if (
    (currentCommand.includes('branch checkout') ||
      currentCommand.includes('b checkout')) &&
    'branch' in argv
  ) {
    // Because --branch is an option on the overall command, we need to check
    // the value of current to make sure that the branch argument is the
    // current argument being entered by the user.
    if (current === '--branch') {
      return '';
    } else if (current === argv['branch']) {
      return current;
    }
  }

  // gt bco
  // Check membership in argv to ensure that "bco" is its own entry (and not
  // a substring of another command). Since we're dealing with a positional,
  // we also want to make sure that the current argument is the positional
  // (position 3).
  if (
    argv['_'].includes('bco') &&
    argv['_'].length <= 3 &&
    typeof current === 'string'
  ) {
    return current;
  }

  // gt b co
  if (
    currentCommand.includes('b co') &&
    argv['_'].includes('b') &&
    argv['_'].includes('co') &&
    argv['_'].length <= 4 &&
    typeof current === 'string'
  ) {
    return current;
  }

  // gt upstack onto <branch_name>
  if (
    currentCommand.includes('upstack onto') ||
    currentCommand.includes('us onto')
  ) {
    // Again, since we're detailing with a positional, we want to make sure
    // that the current argument being entered is in the desired position,
    // i.e. position 4.
    if (argv['_'].length <= 4 && typeof current === 'string') {
      return current;
    }
  }

  return null;
}
