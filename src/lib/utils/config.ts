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
};
type RepoConfigT = {
  trunkBranches?: string[];
};

export const CURRENT_REPO_CONFIG_PATH: string | undefined = (() => {
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

export let repoConfig: RepoConfigT = {};
if (CURRENT_REPO_CONFIG_PATH && fs.existsSync(CURRENT_REPO_CONFIG_PATH)) {
  const repoConfigRaw = fs.readFileSync(CURRENT_REPO_CONFIG_PATH);
  try {
    repoConfig = JSON.parse(repoConfigRaw.toString().trim()) as RepoConfigT;
  } catch (e) {
    console.log(chalk.yellow(`Warning: Malformed ${CURRENT_REPO_CONFIG_PATH}`));
  }
}

export const trunkBranches: string[] | undefined = repoConfig.trunkBranches;
