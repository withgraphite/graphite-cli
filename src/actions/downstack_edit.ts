import { readMetaStack } from '../lib/utils/read_meta_stack';
import { currentBranchPrecondition } from '../lib/preconditions';
import { Stack } from '../wrapper-classes';
import Branch from '../wrapper-classes/branch';
import { StackEditConfig } from '../lib/config/downstack_edit_temp_config';
import { getTrunk, logDebug, logInfo, logSuccess } from '../lib/utils';
import { execSync } from 'child_process';
import { userConfig } from '../lib/config';
import { stackOnto } from './onto';
import { validateStack } from './validate';
import chalk from 'chalk';
import prompts from 'prompts';
import { ExitCancelledError, KilledError } from '../lib/errors';

export async function editAction(): Promise<Stack> {
  const currentStack = readMetaStack({
    currentBranch: currentBranchPrecondition(),
    scope: 'DOWNSTACK',
  });

  const newStackOrder = await readNewBranchOrder(currentStack);

  validateBranchesInNewOrder(newStackOrder, currentStack);

  const newStack = await createNewStackFromOrder(currentStack, newStackOrder);
  logSuccess(`Updated Stack is: ${newStack}`);

  try {
    validateStack('DOWNSTACK', newStack);
  } catch {
    throw Error(`Something went wrong, the newly created stack is not valid.`);
  }

  return newStack;
}

type StackEditOperation = 'PICK' | 'DROP';

export type StackOrderNode = {
  branch: Branch;
  operation: StackEditOperation;
};

function editAndParseEditConfig(configObj: StackEditConfig): StackOrderNode[] {
  const fileName = configObj.getStackEditTempConfig();
  execSync(`${userConfig.getEditor()} '${fileName}'`, { stdio: 'inherit' });
  return configObj.readFileContents();
}

async function readNewBranchOrder(
  currentStack: Stack
): Promise<StackOrderNode[]> {
  const configObj = new StackEditConfig(currentStack);
  let response = false;
  let newStackOrder = [];
  do {
    newStackOrder = editAndParseEditConfig(configObj);
    logInfo(chalk.cyan(`Reading the new order from input... \n`));
    //TODO: Do pretty print to show resulting stack structure instead with
    // actions in brackets and colors to display changes (grey for drop etc)
    for (const stackOrderNode of newStackOrder) {
      logInfo(
        `${chalk.yellow(stackOrderNode.operation)} \t ${stackOrderNode.branch}`
      );
    }

    response = (
      await prompts(
        {
          type: 'confirm',
          name: 'value',
          message: `Proceed with this these edit instructions?`,
          initial: true,
        },
        {
          onCancel: () => {
            throw new KilledError();
          },
        }
      )
    ).value;
  } while (!response);

  configObj.cleanUp(); //TODO (Greg): How to clean up if we fail before this line. Ans: Separate PR to add cleanup logic to `repo sync/repo fix`
  return newStackOrder;
}

function validateBranchesInNewOrder(
  newStackOrder: StackOrderNode[],
  currentStack: Stack
): void {
  const currentStackBranchNames = currentStack.branches().map((b) => b.name);
  const branchesInTheNewStackOrder = newStackOrder.map(
    (node) => node.branch.name
  );

  // Since we add a row `DROP` to the structure for every deleted row when
  // reading the structure, all branches should be here UNLESS there was a typo
  const unAccountedBranches = currentStackBranchNames.filter(
    (b) => !branchesInTheNewStackOrder.includes(b)
  );

  const newBranches = branchesInTheNewStackOrder.filter(
    (b) => !currentStackBranchNames.includes(b)
  );

  if (unAccountedBranches.length || newBranches.length) {
    if (unAccountedBranches.length) {
      logDebug(`Branches unaccounted for: ${unAccountedBranches}`);
    }
    if (newBranches.length) {
      logDebug(`Unknown branches added: ${newBranches}`);
    }
    throw new ExitCancelledError(
      'Some branches from the stack were unaccounted for (could be a typo) ' +
        'and/or new branches not previously in stack were detected (branch ' +
        'creation not allowed). Please try again.'
    );
  }
}

/*
 * We want to start the reordering by moving the first branch onto main and
 * building the stack bottom-up. Doing it the other way around will create cycles.
 */
async function createNewStackFromOrder(
  currentStack: Stack,
  newStackOrder: StackOrderNode[]
): Promise<Stack> {
  const branchesToBePicked = newStackOrder
    .filter((node) => node.operation === 'PICK')
    .map((node) => node.branch);
  logInfo(`Branches to be reordered: ${branchesToBePicked}`); // TODO: Switch this to logDebug and print with index

  // Stack the branches-to-be-reordered from top to bottom on each other
  // TODO (Greg): would this fail to reorder a branch who's parent was originally trunk, onto trunk?
  for (let i = 0; i < branchesToBePicked.length - 1; i++) {
    await stackOnto(
      branchesToBePicked[i + 1],
      branchesToBePicked[i].name,
      'TOP_OF_CALLSTACK_WITH_NOTHING_AFTER' // TODO (Tomas and Greg): Is this the right flag to do this?
    );
  }

  const newStack = readMetaStack({
    currentBranch: branchesToBePicked[branchesToBePicked.length - 1], // stack top
    scope: 'DOWNSTACK',
  });

  // Lastly, stack the branches-to-be-dropped on to main
  const branchesToBeDropped = newStackOrder
    .filter((node) => node.operation === 'DROP')
    .map((node) => node.branch);

  logDebug(
    `Branches to be dropped (will be stacked on main): ${branchesToBeDropped}`
  );

  for (const branch of branchesToBeDropped) {
    logInfo(`branch ${branch} will be stacked on to trunk`);
    await stackOnto(
      branch,
      getTrunk().name,
      'TOP_OF_CALLSTACK_WITH_NOTHING_AFTER' // TODO (Tomas and Greg): Is this the right flag to do this?
    );
  }

  return newStack;
}
