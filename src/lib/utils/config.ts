import chalk from "chalk";
import fs from "fs-extra";
import os from "os";
import path from "path";
import { gpExecSync } from "./exec_sync";
import { logErrorAndExit } from "./splog";

const CONFIG_NAME = ".graphite_repo_config";
const USER_CONFIG_PATH = path.join(os.homedir(), CONFIG_NAME);
type UserConfigT = {
  branchPrefix?: string;
  authToken?: string;
};
type RepoConfigT = {
  trunkBranches?: string[];
  owner?: string;
  repoName?: string;
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

export function makeId(length: number): string {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

// TODO: validate the shape of this (possibly using retype)
export let userConfig: UserConfigT = {};
if (fs.existsSync(USER_CONFIG_PATH)) {
  const userConfigRaw = fs.readFileSync(USER_CONFIG_PATH);
  try {
    userConfig = JSON.parse(userConfigRaw.toString().trim()) as UserConfigT;
  } catch (e) {
    console.log(chalk.yellow(`Warning: Malformed ${USER_CONFIG_PATH}`));
  }
}

export function setUserAuthToken(authToken: string): void {
  const newConfig = {
    ...userConfig,
    authToken: authToken,
  };
  setUserConfig(newConfig);
}

function setUserConfig(config: UserConfigT): void {
  fs.writeFileSync(USER_CONFIG_PATH, JSON.stringify(config));
  userConfig = config;
}

export let repoConfig: RepoConfigT = {};
const inferredRepoInfo = inferRepoInfo();
if (fs.existsSync(CURRENT_REPO_CONFIG_PATH)) {
  const repoConfigRaw = fs.readFileSync(CURRENT_REPO_CONFIG_PATH);
  try {
    repoConfig = JSON.parse(repoConfigRaw.toString().trim()) as RepoConfigT;
  } catch (e) {
    console.log(chalk.yellow(`Warning: Malformed ${CURRENT_REPO_CONFIG_PATH}`));
  }
}

if (inferredRepoInfo !== null) {
  if (
    repoConfig !== null &&
    (repoConfig.owner === undefined || repoConfig.repoName === undefined)
  ) {
    repoConfig = {
      ...repoConfig,
      owner: inferredRepoInfo.owner,
      repoName: inferredRepoInfo.name,
    };
  } else {
    repoConfig = {
      owner: inferredRepoInfo.owner,
      repoName: inferredRepoInfo.name,
    };
  }
  updateRepoConfig(repoConfig);
}

function updateRepoConfig(config: RepoConfigT) {
  fs.writeFileSync(CURRENT_REPO_CONFIG_PATH, JSON.stringify(config));
  repoConfig = config;
}

function inferRepoInfo(): {
  owner: string;
  name: string;
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

  // e.g. in screenplaydev/graphite-cli we're trying to parse 'screenplaydev'
  // and 'graphite-cli'
  const matches = /git@github.com:([^/]+)\/(.+)?.git/.exec(url);
  const owner = matches?.[1];
  const name = matches?.[2];

  if (owner === undefined || name === undefined) {
    return null;
  }

  return {
    owner: owner,
    name: name,
  };
}

export const trunkBranches: string[] | undefined = repoConfig.trunkBranches;
