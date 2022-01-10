import { read_current_stack } from '../lib/utils/read_current_stack';
import { currentBranchPrecondition } from '../lib/preconditions';
import { Stack } from '../wrapper-classes';
import Branch from '../wrapper-classes/branch';
import { StackEditConfig } from '../lib/config/stack_edit_config';
import { getTrunk, logInfo, logSuccess } from '../lib/utils';
import { execSync } from 'child_process';
import { userConfig } from '../lib/config';
import { stackOnto } from './onto';
import { validateStack } from './validate';

export async function editAction(): Promise<Stack> {
  const currentStack = read_current_stack({
    currentBranch: currentBranchPrecondition(),
    scope: 'DOWNSTACK',
  });

  const newStackOrder = readNewOrderingInteractiveMode(currentStack);
  for (let i = 0; i < newStackOrder.length; i++) {
    logInfo(`${newStackOrder[i].operation} ${newStackOrder[i].branch}`);
  }

  // Step 3: Validate new ordering
  //TODO: Clearer instructions on how things are interpreted.
  if (!validateNewOrder(newStackOrder, currentStack)) {
    throw Error(
      `Some branches in the existing stack have not been accounted for. Please try again`
    );
  }

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

export default class StackOrderNode {
  branch: Branch;
  operation: StackEditOperation;

  constructor(opts: { branch: Branch; operation: StackEditOperation }) {
    this.branch = opts.branch;
    this.operation = opts.operation;
  }
}

function readNewOrderingInteractiveMode(currentStack: Stack): StackOrderNode[] {
  const configObj = new StackEditConfig(currentStack);
  const fileName = configObj.getStackEditSwpFile();
  execSync(`${userConfig.getEditor()} ${fileName}`, { stdio: 'inherit' });
  const newStackOrder = configObj.readFileContents();
  configObj.cleanUp();
  return newStackOrder;
}

function validateNewOrder(
  newStackOrder: StackOrderNode[],
  currentStack: Stack
): boolean {
  const branchesInTheNewStackOrder = new Set(
    newStackOrder.map((node) => node.branch)
  );
  return branchesInTheNewStackOrder.size == currentStack.branches().length;
}

/*
We want to start the reordering by moving the first branch onto main and
building the stack bottom-up. Doing it the other way around will create cycles.
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
  for (let i = 0; i < branchesToBePicked.length - 1; i++) {
    await stackOnto(
      branchesToBePicked[i + 1],
      branchesToBePicked[i].name,
      'TOP_OF_CALLSTACK_WITH_NOTHING_AFTER'
    );
  }

  const newStack = read_current_stack({
    currentBranch: currentBranchPrecondition(),
    scope: 'DOWNSTACK',
  });

  // Lastly, stack the branches-to-be-dropped on to main
  const branchesToBeDropped = newStackOrder
    .filter((node) => node.operation === 'DROP')
    .map((node) => node.branch);

  logInfo(
    `Branches to be dropped (will be stacked on main): ${branchesToBeDropped}`
  ); // TODO: Switch this to logDebug
  for (const branch of branchesToBeDropped) {
    logInfo(`branch ${branch} will be stacked on to trunk`);
    await stackOnto(
      branch,
      getTrunk().name,
      'TOP_OF_CALLSTACK_WITH_NOTHING_AFTER'
    );
  }

  return newStack;
}
