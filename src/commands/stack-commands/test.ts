import chalk from 'chalk';
import fs from 'fs-extra';
import tmp from 'tmp';
import yargs from 'yargs';
import { validate } from '../../actions/validate';
import { ValidationFailedError } from '../../lib/errors';
import { currentBranchPrecondition } from '../../lib/preconditions';
import { profile } from '../../lib/telemetry';
import { checkoutBranch, getTrunk, gpExecSync, logInfo } from '../../lib/utils';
import { GitStackBuilder } from '../../wrapper-classes';

const args = {
  command: {
    describe: `The command you'd like to run on each branch of your stack.`,
    demandOption: true,
    type: 'string',
    alias: 'c',
    positional: true,
  },
  'skip-trunk': {
    describe: `Dont run the command on the trunk branch.`,
    demandOption: false,
    default: true,
    type: 'boolean',
  },
} as const;
type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const command = 'test <command>';
export const canonical = 'stack test';
export const aliases = ['t'];
export const description =
  'Checkout each branch in your stack, run the provided command, and aggregate the results. Good finding bugs in your stack.';
export const builder = args;
export const handler = async (argv: argsT): Promise<void> => {
  return profile(argv, canonical, async () => {
    testStack(argv.command, { skipTrunk: argv['skip-trunk'] });
  });
};

type TestStatusT = '[pending]' | '[success]' | '[fail]' | '[running]';
type StateT = {
  [branchName: string]: { status: TestStatusT; duration: number | undefined };
};

function testStack(command: string, opts: { skipTrunk: boolean }): void {
  const originalBranch = currentBranchPrecondition();
  validateStack();

  logInfo(chalk.grey(`Getting stack...`));
  const stack = new GitStackBuilder().fullStackFromBranch(originalBranch);
  logInfo(chalk.grey(stack.toString() + '\n'));

  // Get branches to test.
  const branches = stack.branches().filter((b) => {
    if (opts.skipTrunk && b.name == getTrunk().name) {
      return false;
    }
    return true;
  });

  // Initialize state to print out.
  const state: StateT = {};
  branches.forEach((b) => {
    state[b.name] = { status: '[pending]', duration: undefined };
  });

  // Create a tmp output file for debugging.
  const tmpDir = tmp.dirSync();
  const outputPath = `${tmpDir.name}/output.txt`;
  fs.writeFileSync(outputPath, '');
  logInfo(chalk.grey(`Writing results to ${outputPath}\n`));

  // Kick off the testing.
  logState(state, false);
  branches.forEach((branch) => {
    testBranch({ command, branchName: branch.name, outputPath, state });
  });

  // Finish off.
  checkoutBranch(originalBranch.name);
}

function testBranch(opts: {
  state: StateT;
  branchName: string;
  command: string;
  outputPath: string;
}) {
  checkoutBranch(opts.branchName);

  // Mark the branch as running.
  opts.state[opts.branchName].status = '[running]';
  logState(opts.state, true);

  // Execute the command.
  const startTime = Date.now();
  fs.appendFileSync(opts.outputPath, `\n\n${opts.branchName}\n`);
  const output = gpExecSync(
    { command: opts.command, options: { stdio: 'pipe' } },
    () => {
      opts.state[opts.branchName].status = '[fail]';
    }
  ).toString();
  fs.appendFileSync(opts.outputPath, output);
  if (opts.state[opts.branchName].status !== '[fail]') {
    opts.state[opts.branchName].status = '[success]';
  }
  opts.state[opts.branchName].duration = Date.now() - startTime;

  // Write output to the output file.

  logState(opts.state, true);
}

function logState(state: StateT, refresh: boolean) {
  if (refresh) {
    process.stdout.moveCursor(0, -Object.keys(state).length);
  }
  Object.keys(state).forEach((branchName) => {
    const color: (arg0: string) => string =
      state[branchName].status === '[fail]'
        ? chalk.red
        : state[branchName].status === '[success]'
        ? chalk.green
        : state[branchName].status === '[running]'
        ? chalk.cyan
        : chalk.grey;
    const duration: string | undefined = state[branchName].duration
      ? new Date(state[branchName].duration!)
          .toISOString()
          .split(/T/)[1]
          .replace(/\..+/, '')
      : undefined;
    process.stdout.clearLine(0);
    // Example:
    // - [success]: tr--Track_CLI_and_Graphite_user_assoicat (00:00:22)
    logInfo(
      `- ${color(state[branchName].status)}: ${branchName}${
        duration ? ` (${duration})` : ''
      }`
    );
  });
}

function validateStack(): void {
  try {
    validate('FULLSTACK');
  } catch (err) {
    throw new ValidationFailedError(
      `Failed to validate fullstack before testing`
    );
  }
}
