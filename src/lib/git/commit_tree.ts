import {
  runGitCommand,
  runGitCommandAndSplitLines,
} from '../utils/run_command';
import { getSha } from './get_sha';

export function getCommitTree(branchNames: string[]): Record<string, string[]> {
  const parentOfMergeBase = getSha(
    `${runGitCommand({
      args: [`merge-base`, `--octopus`, ...branchNames],
      onError: 'ignore',
      resource: 'parentOfMergeBase',
    })}~`
  );
  const ret: Record<string, string[]> = {};
  runGitCommandAndSplitLines({
    args: [
      `rev-list`,
      `--parents`,
      ...(parentOfMergeBase
        ? [`^${parentOfMergeBase}`, ...branchNames]
        : [`--all`]),
    ],
    options: {
      maxBuffer: 1024 * 1024 * 1024,
    },
    onError: 'throw',
    resource: 'getCommitTree',
  })
    .map((l) => l.split(' '))
    .forEach((l) => (ret[l[0]] = l.slice(1)));
  return ret;
}
