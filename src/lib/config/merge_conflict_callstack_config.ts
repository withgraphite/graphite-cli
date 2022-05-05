import * as t from '@withgraphite/retype';
import { TContext } from '../context';
import { StackedEditSchema } from './../../actions/edit/stack_edits';
import { composeConfig } from './compose_config';

/**
 * After Graphite is interrupted by a merge conflict, upon continuing, there
 * are 2 main things we need to do.
 *
 * 1) Complete the original rebase operation.
 * 2) Perform any needed follow-up actions that were supposed to occur after
 *    the rebase in the original callstack.
 *
 * The below object helps keep track of these items and persist them across
 * invocations of the CLI.
 */

const StackEditStackFrameSchema = t.shape({
  op: t.literal('STACK_EDIT_CONTINUATION' as const),
  currentBranchName: t.string,
  remainingEdits: t.array(StackedEditSchema),
});

const StackOntoBaseRebaseStackFrameSchema = t.shape({
  op: t.literal('STACK_ONTO_BASE_REBASE_CONTINUATION' as const),
  currentBranchName: t.string,
  onto: t.string,
});

const StackOntoFixStackFrameSchema = t.shape({
  op: t.literal('STACK_ONTO_FIX_CONTINUATION' as const),
  currentBranchName: t.string,
  onto: t.string,
});

const StackFixActionStackFrameSchema = t.shape({
  op: t.literal('STACK_FIX_ACTION_CONTINUATION' as const),
  checkoutBranchName: t.string,
});

const RestackNodeStackFrameSchema = t.shape({
  op: t.literal('STACK_FIX' as const),
  sourceBranchName: t.string,
});

const DeleteBranchesStackFrameSchema = t.shape({
  op: t.literal('DELETE_BRANCHES_CONTINUATION' as const),
  force: t.boolean,
  showDeleteProgress: t.boolean,
});

const RepoFixBranchCountSanityCheckStackFrameSchema = t.shape({
  op: t.literal('REPO_FIX_BRANCH_COUNT_SANTIY_CHECK_CONTINUATION' as const),
});

const RepoSyncStackFrameSchema = t.shape({
  op: t.literal('REPO_SYNC_CONTINUATION' as const),
  force: t.boolean,
  resubmit: t.boolean,
  oldBranchName: t.string,
});

export type TStackEditStackFrame = t.TypeOf<typeof StackEditStackFrameSchema>;
export type TStackOntoBaseRebaseStackFrame = t.TypeOf<
  typeof StackOntoBaseRebaseStackFrameSchema
>;
export type TStackOntoFixStackFrame = t.TypeOf<
  typeof StackOntoFixStackFrameSchema
>;
export type TStackFixActionStackFrame = t.TypeOf<
  typeof StackFixActionStackFrameSchema
>;
export type TRestackNodeStackFrame = t.TypeOf<
  typeof RestackNodeStackFrameSchema
>;
export type TDeleteBranchesStackFrame = t.TypeOf<
  typeof DeleteBranchesStackFrameSchema
>;
export type TRepoFixBranchCountSanityCheckStackFrame = t.TypeOf<
  typeof RepoFixBranchCountSanityCheckStackFrameSchema
>;
export type TRepoSyncStackFrame = t.TypeOf<typeof RepoSyncStackFrameSchema>;

const GraphiteFrameSchema = t.unionMany([
  StackOntoBaseRebaseStackFrameSchema,
  StackOntoFixStackFrameSchema,
  StackFixActionStackFrameSchema,
  RestackNodeStackFrameSchema,
  DeleteBranchesStackFrameSchema,
  RepoFixBranchCountSanityCheckStackFrameSchema,
  RepoSyncStackFrameSchema,
  StackEditStackFrameSchema,
]);

const MergeConflictCallstackSchema = t.shape({
  callstack: t.array(GraphiteFrameSchema),
});

export type TMergeConflictCallstack = t.TypeOf<
  typeof MergeConflictCallstackSchema
>['callstack'];

export const mergeConflictCallstackConfigFactory = composeConfig({
  schema: MergeConflictCallstackSchema,
  defaultLocations: [
    {
      relativePath: '.graphite_merge_conflict',
      relativeTo: 'REPO',
    },
  ],
  initialize: () => {
    return { callstack: [] };
  },
  helperFunctions: () => {
    return {} as const;
  },
  options: { removeIfEmpty: true, removeIfInvalid: true },
});

export function persistMergeConflictCallstack(
  callstack: TMergeConflictCallstack,
  context: TContext
): void {
  if (!context.mergeConflictCallstackConfig) {
    context.mergeConflictCallstackConfig =
      mergeConflictCallstackConfigFactory.load();
  }
  context.mergeConflictCallstackConfig.update(
    (data) => (data.callstack = callstack)
  );
}
