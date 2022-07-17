import * as t from '@withgraphite/retype';
import { cuteString } from '../utils/cute_string';
import { q } from '../utils/escape_for_shell';
import { gpExecSync, gpExecSyncAndSplitLines } from '../utils/exec_sync';

export const prInfoSchema = t.shape({
  number: t.optional(t.number),
  base: t.optional(t.string),
  url: t.optional(t.string),
  title: t.optional(t.string),
  body: t.optional(t.string),
  state: t.optional(
    t.unionMany([
      t.literal('OPEN' as const),
      t.literal('CLOSED' as const),
      t.literal('MERGED' as const),
    ])
  ),
  reviewDecision: t.optional(
    t.unionMany([
      t.literal('APPROVED' as const),
      t.literal('REVIEW_REQUIRED' as const),
      t.literal('CHANGES_REQUESTED' as const),
    ])
  ),
  isDraft: t.optional(t.boolean),
});
export type TBranchPRInfo = t.TypeOf<typeof prInfoSchema>;

const metaSchema = t.shape({
  parentBranchName: t.optional(t.string),
  parentBranchRevision: t.optional(t.string),
  prInfo: t.optional(prInfoSchema),
});
export type TMeta = t.TypeOf<typeof metaSchema>;

export function writeMetadataRef(
  branchName: string,
  meta: TMeta,
  cwd?: string
): void {
  const metaSha = gpExecSync({
    command: `git hash-object -w --stdin`,
    options: {
      input: cuteString(meta),
      cwd,
    },
    onError: 'throw',
  });
  gpExecSync({
    command: `git update-ref refs/branch-metadata/${q(branchName)} ${metaSha}`,
    options: {
      stdio: 'pipe',
      cwd,
    },
    onError: 'throw',
  });
}

export function readMetadataRef(branchName: string, cwd?: string): TMeta {
  try {
    const meta = JSON.parse(
      gpExecSync({
        command: `git cat-file -p refs/branch-metadata/${q(
          branchName
        )} 2> /dev/null`,
        options: {
          cwd,
        },
        onError: 'ignore',
      })
    );

    return metaSchema(meta) ? meta : {};
  } catch {
    return {};
  }
}

export function deleteMetadataRef(branchName: string): void {
  gpExecSync({
    command: `git update-ref -d refs/branch-metadata/${q(branchName)}`,
    onError: 'ignore',
  });
}

export function getMetadataRefList(): Record<string, string> {
  const meta: Record<string, string> = {};

  gpExecSyncAndSplitLines({
    command: `git for-each-ref --format='%(refname:lstrip=2):%(objectname)' refs/branch-metadata/`,
    onError: 'throw',
  })
    .map((line) => line.split(':'))
    .filter(
      (lineSplit): lineSplit is [string, string] =>
        lineSplit.length === 2 && lineSplit.every((s) => s.length > 0)
    )
    .forEach(([branchName, metaSha]) => (meta[branchName] = metaSha));

  return meta;
}
