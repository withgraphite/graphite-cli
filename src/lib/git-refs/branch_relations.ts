import { Branch } from '../../wrapper-classes/branch';
import { cache } from '../config/cache';
import { TContext } from '../context';
import { gpExecSync } from '../utils/exec_sync';

export function getRevListGitTree(
  opts: {
    useMemoizedResults: boolean;
    direction: 'parents' | 'children';
  },
  context: TContext
): Record<string, string[]> {
  if (opts.useMemoizedResults) {
    const cachedRevList =
      opts.direction === 'parents'
        ? cache.getParentsRevList()
        : cache.getChildrenRevList();

    if (cachedRevList) return cachedRevList;
  }
  const allBranches = Branch.allBranches(context)
    .map((b) => b.name)
    .join(' ');
  const revList = gitTreeFromRevListOutput(
    gpExecSync({
      command:
        // Check that there is a commit behind this branch before getting the full list.
        `git rev-list --${opts.direction} ^$(git merge-base --octopus ${allBranches})~1 ${allBranches} 2> /dev/null || git rev-list --${opts.direction} --all`,
      options: {
        maxBuffer: 1024 * 1024 * 1024,
      },
    })
      .toString()
      .trim()
  );
  if (opts.direction === 'parents') {
    cache.setParentsRevList(revList);
  } else if (opts.direction === 'children') {
    cache.setChildrenRevList(revList);
  }
  return revList;
}

function gitTreeFromRevListOutput(output: string): Record<string, string[]> {
  const ret: Record<string, string[]> = {};
  for (const line of output.split('\n')) {
    if (line.length > 0) {
      const shas = line.split(' ');
      ret[shas[0]] = shas.slice(1);
    }
  }

  return ret;
}
