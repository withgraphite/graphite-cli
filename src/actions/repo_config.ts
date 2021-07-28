import chalk from "chalk";
import fs from "fs-extra";
import path from "path";
import { gpExecSync, logErrorAndExit } from "../lib/utils";

const CONFIG_NAME = ".graphite_repo_config";
type RepoConfigT = {
  owner?: string;
  name?: string;
  trunkBranches?: string[];
};

export const CURRENT_REPO_CONFIG_PATH: string = (() => {
  const repoRootPath = gpExecSync(
    {
      command: `git rev-parse --show-toplevel`,
    },
    (e) => {
      return Buffer.alloc(0);
    }
  )
    .toString()
    .trim();

  if (!repoRootPath || repoRootPath.length === 0) {
    logErrorAndExit("No .git repository found.");
  }

  return path.join(repoRootPath, CONFIG_NAME);
})();

let repoConfig: RepoConfigT = {};
if (fs.existsSync(CURRENT_REPO_CONFIG_PATH)) {
  const repoConfigRaw = fs.readFileSync(CURRENT_REPO_CONFIG_PATH);
  try {
    repoConfig = JSON.parse(repoConfigRaw.toString().trim()) as RepoConfigT;
  } catch (e) {
    console.log(chalk.yellow(`Warning: Malformed ${CURRENT_REPO_CONFIG_PATH}`));
  }
}

export function getRepoOwner(): string {
  if (repoConfig.owner) {
    return repoConfig.owner;
  }

  const inferredInfo = inferRepoGitHubInfo();
  if (inferredInfo?.repoOwner) {
    return inferredInfo.repoOwner;
  }

  logErrorAndExit(
    "Could not determine the owner of this repo (e.g. 'screenplaydev' in the repo 'screenplaydev/graphite-cli'). Please run `gp repo-config owner --set <owner>` to manually set the repo owner."
  );
}

export function setRepoOwner(owner: string): void {
  repoConfig.owner = owner;
  persistRepoConfig(repoConfig);
}

export function getRepoName(): string {
  if (repoConfig.name) {
    return repoConfig.name;
  }

  const inferredInfo = inferRepoGitHubInfo();
  if (inferredInfo?.repoName) {
    return inferredInfo.repoName;
  }

  logErrorAndExit(
    "Could not determine the name of this repo (e.g. 'graphite-cli' in the repo 'screenplaydev/graphite-cli'). Please run `gp repo-config name --set <owner>` to manually set the repo name."
  );
}

export function setRepoName(name: string): void {
  repoConfig.name = name;
  persistRepoConfig(repoConfig);
}

function persistRepoConfig(config: RepoConfigT): void {
  fs.writeFileSync(CURRENT_REPO_CONFIG_PATH, JSON.stringify(config));
}

export const trunkBranches: string[] | undefined = repoConfig.trunkBranches;

function inferRepoGitHubInfo(): {
  repoOwner: string;
  repoName: string;
} | null {
  // This assumes that the remote to use is named 'origin' and that the remote
  // to fetch from is the same as the remote to push to. If a user runs into
  // an issue where any of these invariants are not true, they can manually
  // edit the repo config file to overrule what our CLI tries to intelligently
  // infer.
  const url = gpExecSync(
    {
      command: `git config --get remote.origin.url`,
    },
    (_) => {
      return Buffer.alloc(0);
    }
  )
    .toString()
    .trim();
  if (!url || url.length === 0) {
    return null;
  }

  let regex = undefined;
  if (url.startsWith("git@github.com")) {
    regex = /git@github.com:([^/]+)\/(.+)?.git/;
  } else if (url.startsWith("https://")) {
    regex = /https:\/\/github.com\/([^/]+)\/(.+)?.git/;
  } else {
    return null;
  }

  // e.g. in screenplaydev/graphite-cli we're trying to get the owner
  // ('screenplaydev') and the repo name ('graphite-cli')
  const matches = regex.exec(url);
  const owner = matches?.[1];
  const name = matches?.[2];

  if (owner === undefined || name === undefined) {
    return null;
  }

  return {
    repoOwner: owner,
    repoName: name,
  };
}
