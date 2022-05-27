import * as t from '@withgraphite/retype';
import { TContext } from '../context';
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

const DeleteBranchesStackFrameSchema = t.shape({
  op: t.literal('DELETE_BRANCHES_CONTINUATION' as const),
  force: t.boolean,
  showDeleteProgress: t.boolean,
});

const RepoSyncStackFrameSchema = t.shape({
  op: t.literal('REPO_SYNC_CONTINUATION' as const),
  force: t.boolean,
  resubmit: t.boolean,
  oldBranchName: t.string,
});

export type TDeleteBranchesStackFrame = t.TypeOf<
  typeof DeleteBranchesStackFrameSchema
>;
export type TRepoSyncStackFrame = t.TypeOf<typeof RepoSyncStackFrameSchema>;

const GraphiteFrameSchema = t.unionMany([
  DeleteBranchesStackFrameSchema,
  RepoSyncStackFrameSchema,
]);

const MergeConflictCallstackSchema = t.shape({
  // only one of these will actually ever be set (see below)
  // TODO callstack to be deprecated
  callstack: t.array(GraphiteFrameSchema),
  branchNames: t.array(t.string),
  currentBranchOverride: t.optional(t.string),
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
    return { callstack: [], branchNames: [] };
  },
  helperFunctions: () => {
    return {} as const;
  },
  options: { removeIfEmpty: true, removeIfInvalid: true },
});

export type TMergeConflictCallstackConfig = ReturnType<
  typeof mergeConflictCallstackConfigFactory.load
>;

export function persistMergeConflictCallstack(
  callstack: TMergeConflictCallstack,
  context: TContext
): void {
  context.mergeConflictCallstackConfig.update(
    (data) => (data.callstack = callstack)
  );
}

export function persistBranchesToRestack(
  branchNames: string[],
  context: TContext
): void {
  context.splog.logDebug(
    branchNames.reduce((acc, curr) => `${acc}\n${curr}`, 'PERSISTING:')
  );
  context.mergeConflictCallstackConfig.update((data) => {
    data.branchNames = branchNames;
    data.currentBranchOverride = context.metaCache.currentBranch;
  });
}
