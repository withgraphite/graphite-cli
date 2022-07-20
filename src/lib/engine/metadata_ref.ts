import * as t from '@withgraphite/retype';
import { cuteString } from '../utils/cute_string';
import { runCommand, runCommandAndSplitLines } from '../utils/run_command';

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
  const metaSha = runCommand({
    command: `git`,
    args: [`hash-object`, `-w`, `--stdin`],
    options: {
      input: cuteString(meta),
      cwd,
    },
    onError: 'throw',
  });
  runCommand({
    command: `git`,
    args: [`update-ref`, `refs/branch-metadata/${branchName}`, metaSha],
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
      runCommand({
        command: `git`,
        args: [`cat-file`, `-p`, `refs/branch-metadata/${branchName}`],
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
  runCommand({
    command: `git`,
    args: [`update-ref`, `-d`, `refs/branch-metadata/${branchName}`],
    onError: 'throw',
  });
}

export function getMetadataRefList(): Record<string, string> {
  const meta: Record<string, string> = {};
  runCommandAndSplitLines({
    command: `git`,
    args: [
      `for-each-ref`,
      `--format=%(refname:lstrip=2):%(objectname)`,
      `refs/branch-metadata/`,
    ],
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
