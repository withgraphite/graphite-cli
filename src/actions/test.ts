import chalk from 'chalk';
import fs from 'fs-extra';
import tmp from 'tmp';
import { TContext } from '../lib/context';
import { SCOPE, TScopeSpec } from '../lib/state/scope_spec';
import { gpExecSync } from '../lib/utils/exec_sync';

type TTestStatus = '[pending]' | '[success]' | '[fail]' | '[running]';
type TTestState = {
  [branchName: string]: { status: TTestStatus; duration: number | undefined };
};

export function testStack(
  opts: { scope: TScopeSpec; includeTrunk?: boolean; command: string },
  context: TContext
): void {
  const currentBranch = context.metaCache.currentBranchPrecondition;
  // Get branches to test.
  const branches = context.metaCache
    .getRelativeStack(currentBranch, SCOPE.STACK)
    .filter(
      (branch) => opts.includeTrunk || !context.metaCache.isTrunk(branch)
    );

  // Initialize state to print out.
  const state: TTestState = {};
  branches.forEach((b) => {
    state[b] = { status: '[pending]', duration: undefined };
  });

  // Create a tmp output file for debugging.
  const tmpDir = tmp.dirSync();
  const outputPath = `${tmpDir.name}/output.txt`;
  fs.writeFileSync(outputPath, '');
  context.splog.logInfo(chalk.grey(`Writing results to ${outputPath}\n`));

  // Kick off the testing.
  logState(state, false, context);
  branches.forEach((branchName) =>
    testBranch(
      { command: opts.command, branchName, outputPath, state },
      context
    )
  );

  // Finish off.
  context.metaCache.checkoutBranch(currentBranch);
}

function testBranch(
  opts: {
    state: TTestState;
    branchName: string;
    command: string;
    outputPath: string;
  },
  context: TContext
) {
  context.metaCache.checkoutBranch(opts.branchName);

  // Mark the branch as running.
  opts.state[opts.branchName].status = '[running]';
  logState(opts.state, true, context);

  // Execute the command.
  fs.appendFileSync(opts.outputPath, `\n\n${opts.branchName}\n`);
  const startTime = Date.now();
  const output = gpExecSync({ command: `${opts.command} 2>&1` }, () => {
    opts.state[opts.branchName].status = '[fail]';
  });
  opts.state[opts.branchName].duration = Date.now() - startTime;
  fs.appendFileSync(opts.outputPath, output);
  if (opts.state[opts.branchName].status !== '[fail]') {
    opts.state[opts.branchName].status = '[success]';
  }

  // Write output to the output file.
  logState(opts.state, true, context);
}

function logState(state: TTestState, refresh: boolean, context: TContext) {
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
    const duration = state[branchName].duration;
    const durationString: string | undefined = duration
      ? new Date(duration).toISOString().split(/T/)[1].replace(/\..+/, '')
      : undefined;
    process.stdout.clearLine(0);
    // Example:
    // - [success]: tr--Track_CLI_and_Graphite_user_assoicat (00:00:22)
    context.splog.logInfo(
      `- ${color(state[branchName].status)}: ${branchName}${
        duration ? ` (${durationString})` : ''
      }`
    );
  });
}
