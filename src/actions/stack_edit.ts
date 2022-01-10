import { read_current_stack } from '../lib/utils/read_current_stack';
import { currentBranchPrecondition } from '../lib/preconditions';
import { Stack } from '../wrapper-classes';
import Branch from '../wrapper-classes/branch';
import { validateStack } from './validate';
import { stackOnto } from './onto';

type EditMode = 'DEFAULT' | 'INTERACTIVE';

export function histEditAction(args: { mode: EditMode }): Stack {
  // Step 1: Read existing stack
  const currentStack = read_current_stack({
    currentBranch: currentBranchPrecondition(),
    scope: 'DOWNSTACK',
  });
  // Step 2: Ask user for new stack ordering
  const newStackOrder = getNewStackStructure(args.mode, currentStack);

  // Step 3: Validate new ordering
  if (!validateNewOrder(newStackOrder)) {
    throw Error(`The entered stack is not valid. Please fix and try again`);
  }
  // Step 4: Perform the re-ordering
  const newStack = createNewStackFromOrder(currentStack, newStackOrder);
  // Step 5: Validate new stack
  try {
    validateStack('DOWNSTACK', newStack); //TODO: Change this
  } catch {
    throw Error(`Something went wrong, the newly created stack is not valid.`);
  }
  // Step 6: Return output
  return newStack;
}

type HistEditOperation = 'PICK' | 'DROP' | 'MERGE';

export default class StackOrderNode {
  branches: Branch[];
  operation: HistEditOperation;

  constructor(opts: { branches: Branch[]; operation: HistEditOperation }) {
    this.branches = opts.branches;
    this.operation = opts.operation;
  }
}

function getNewStackStructure(
  mode: EditMode,
  currentStack: Stack
): StackOrderNode[] {
  let newStackOrder;
  if (mode === 'INTERACTIVE') {
    newStackOrder = readNewOrderingInteractiveMode(currentStack);
  } else {
    newStackOrder = readNewOrderingConsole(currentStack);
  }
  return newStackOrder;
}

function readNewOrderingInteractiveMode(currentStack: Stack): StackOrderNode[] {
  //
  //Step 1: Populate file with one row per branch and default setup in full screen mode
  // Step 2: Wait for edit to complete
  // Step 3: Parse input
  // Step 4: Produce list of branches in an array
  return [];
}

function readNewOrderingConsole(currentStack: Stack): StackOrderNode[] {
  //Step 1: Create console input
  // Step 2: Wait for edit to complete
  // Step 3: Parse input
  // Step 4: Produce list of branches in an array
  return [];
}

function validateNewOrder(newStackOrder: StackOrderNode[]): boolean {
  // are there any sanity checks to perform?
  return false;
}

function createNewStackFromOrder(
  currentStack: Stack,
  newStackOrder: StackOrderNode[]
): Stack {
  const branches = [];
  for (const stackOp of newStackOrder) {
    if (stackOp.operation === 'DROP') {
      // DROP will remove the branch from the stack and changes its base to main
    } else if (stackOp.operation === 'MERGE') {
      // MERGE will squash all the commits into one and move it to the new branch
      branches.push(getMergedBranch(stackOp.branches));
    } else {
      // Add to the list as it is.
      branches.concat(stackOp.branches);
    }
  }
  // Read StackOrderNode List
  // Perform operations per StackOrderNode and construct StackNodes
  // Edit meta information of the StackNodes to create new Stack (is this correct? when to rebase?) TODO: What is a rebase? Use the restack function in fix.ts
  // Return new Stack
  return constructStackFromOrderedBranches(branches);
}

function getMergedBranch(branches: Branch[]) {
  //STUB
  return branches[0];
}

async function constructStackFromOrderedBranches(branches: Branch[]) {
  // Downstack (reverse loop) or upstack?
  for (let i = 0; i < branches.length; i++) {
    // TODO: Check ordering is coming into this array correctly
    await stackOnto(
      branches[i],
      branches[i + 1].name,
      'TOP_OF_CALLSTACK_WITH_NOTHING_AFTER'
    );
  }
  return new Stack();
}
