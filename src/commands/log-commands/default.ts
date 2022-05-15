import chalk from 'chalk';
import yargs from 'yargs';
import { printStack } from '../../actions/print_stack';
import { TContext } from '../../lib/context';
import { profile } from '../../lib/telemetry/profile';
import { currentBranchName } from '../../lib/utils/current_branch_name';
import { getTrunk } from '../../lib/utils/trunk';
import { Branch } from '../../wrapper-classes/branch';

const args = {
  'on-trunk': {
    describe: `Only show commits on trunk`,
    demandOption: false,
    default: false,
    type: 'boolean',
    alias: 't',
  },
  'behind-trunk': {
    describe: `Only show commits behind trunk`,
    demandOption: false,
    default: false,
    type: 'boolean',
    alias: 'b',
  },
} as const;

export const command = '*';
export const description = 'Log all stacks tracked by Graphite.';
export const builder = args;
export const canonical = 'log';

type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export const handler = async (argv: argsT): Promise<void> => {
  return profile(argv, canonical, async (context) => {
    // Use our custom logging of branches and stacks:
    if (argv['on-trunk']) {
      printTrunkLog(context);
    } else if (argv['behind-trunk']) {
      await printStacksBehindTrunk(context);
    } else {
      printTrunkLog(context);
      await printStacksBehindTrunk(context);
    }
  });
};

function printTrunkLog(context: TContext): void {
  const trunk = getTrunk(context);
  printStack(
    {
      baseBranch: trunk.useMemoizedResults(),
      indentLevel: 0,
      config: {
        currentBranchName: currentBranchName(),
        offTrunk: true,
        visited: [],
      },
    },
    context
  );
}

async function printStacksBehindTrunk(context: TContext): Promise<void> {
  const trunk = getTrunk(context);
  const branchesWithoutParents = await Branch.getAllBranchesWithoutParents(
    context,
    {
      useMemoizedResults: true,
      maxDaysBehindTrunk: context.repoConfig.getMaxDaysShownBehindTrunk(),
      maxBranches: context.repoConfig.getMaxStacksShownBehindTrunk(),
      excludeTrunk: true,
    }
  );
  if (branchesWithoutParents.length === 0) {
    return;
  }

  console.log('․');
  console.log('․');
  console.log(`․  ${chalk.bold(`Stack(s) below trail ${trunk.name}.`)}`);
  console.log(
    `․  To fix a stack, check out the stack and run \`gt stack fix\`.`
  );
  console.log('․');

  branchesWithoutParents.forEach((branch) => {
    console.log('․');
    printStack(
      {
        baseBranch: branch.useMemoizedResults(),
        indentLevel: 1,
        config: {
          currentBranchName: currentBranchName(),
          offTrunk: false,
          visited: [],
        },
      },
      context
    );
    console.log(`◌──┘`);
    console.log('․');
  });
}
