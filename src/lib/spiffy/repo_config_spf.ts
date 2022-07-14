import * as t from '@withgraphite/retype';
import { ExitFailedError } from '../errors';
import { q } from '../utils/escape_for_shell';
import { gpExecSync } from '../utils/exec_sync';
import { spiffy } from './spiffy';

const schema = t.shape({
  owner: t.optional(t.string),
  name: t.optional(t.string),
  trunk: t.optional(t.string),
  remote: t.optional(t.string),
  lastFetchedPRInfoMs: t.optional(t.number),
});

export const repoConfigFactory = spiffy({
  schema,
  defaultLocations: [
    {
      relativePath: '.graphite_repo_config',
      relativeTo: 'REPO',
    },
  ],
  initialize: () => {
    return {};
  },
  helperFunctions: (data, update) => {
    return {
      setRemote: (remote: string) => {
        update((data) => (data.remote = remote));
      },

      getRemote: () => data.remote ?? 'origin',

      setTrunk: (trunk: string) => {
        update((data) => (data.trunk = trunk));
      },

      graphiteInitialized: (): boolean => !!data.trunk,

      getRepoOwner: (): string => {
        const configOwner = data.owner;
        if (configOwner) {
          return configOwner;
        }

        const inferredInfo = inferRepoGitHubInfo(data.remote ?? 'origin');
        if (inferredInfo?.repoOwner) {
          return inferredInfo.repoOwner;
        }

        throw new ExitFailedError(
          "Could not determine the owner of this repo (e.g. 'withgraphite' in the repo 'withgraphite/graphite-cli'). Please run `gt repo owner --set <owner>` to manually set the repo owner."
        );
      },

      getRepoName: (): string => {
        if (data.name) {
          return data.name;
        }

        const inferredInfo = inferRepoGitHubInfo(data.remote ?? 'origin');
        if (inferredInfo?.repoName) {
          return inferredInfo.repoName;
        }

        throw new ExitFailedError(
          "Could not determine the name of this repo (e.g. 'graphite-cli' in the repo 'withgraphite/graphite-cli'). Please run `gt repo name --set <owner>` to manually set the repo name."
        );
      },
    } as const;
  },
});

function inferRepoGitHubInfo(remote: string): {
  repoOwner: string;
  repoName: string;
} {
  // This assumes the remote to fetch from is the same as the remote to push to.
  // If a user runs into this is not true, they can manually edit the repo config
  // file to overrule what our CLI tries to intelligently infer.
  const url = gpExecSync({
    command: `git config --get remote.${q(remote)}.url`,
    onError: 'ignore',
  });

  const inferError = new ExitFailedError(
    `Failed to infer the owner and name of this repo from remote ${remote} "${url}". Please run \`gt repo owner --set <owner>\` and \`gt repo name --set <name>\` to manually set the repo owner/name. (e.g. in the repo 'withgraphite/graphite-cli', 'withgraphite' is the repo owner and 'graphite-cli' is the repo name)`
  );
  if (!url) {
    throw inferError;
  }

  const { owner, name } = getOwnerAndNameFromURL(url);
  if (owner === undefined || name === undefined) {
    throw inferError;
  }

  return {
    repoOwner: owner,
    repoName: name,
  };
}

const OWNER_NAME_REGEX = /.*github\.com[:/]([^/]+)\/(.+)/;

export function getOwnerAndNameFromURL(originURL: string): {
  owner: string | undefined;
  name: string | undefined;
} {
  // Most of the time these URLs end with '.git', but sometimes they don't. To
  // keep things clean, when we see it we'll just chop it off.
  let url = originURL;
  if (url.endsWith('.git')) {
    url = url.slice(0, -'.git'.length);
  }

  // e.g. in withgraphite/graphite-cli we're trying to get the owner
  // ('withgraphite') and the repo name ('graphite-cli')
  const matches = OWNER_NAME_REGEX.exec(url);
  return {
    owner: matches?.[1],
    name: matches?.[2],
  };
}

export type TRepoConfig = ReturnType<typeof repoConfigFactory.load>;
