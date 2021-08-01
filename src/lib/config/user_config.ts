import chalk from "chalk";
import fs from "fs-extra";
import os from "os";
import path from "path";

const DEPRECATED_CONFIG_NAME = ".graphite_repo_config";
const CONFIG_NAME = ".graphite_user_config";
const DEPRECATED_USER_CONFIG_PATH = path.join(
  os.homedir(),
  DEPRECATED_CONFIG_NAME
);
const USER_CONFIG_PATH = path.join(os.homedir(), CONFIG_NAME);

if (fs.existsSync(DEPRECATED_USER_CONFIG_PATH)) {
  if (fs.existsSync(USER_CONFIG_PATH)) {
    fs.removeSync(DEPRECATED_USER_CONFIG_PATH);
  } else {
    fs.moveSync(DEPRECATED_USER_CONFIG_PATH, USER_CONFIG_PATH);
  }
}

type UserConfigT = {
  branchPrefix?: string;
  authToken?: string;
};

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
export let config: UserConfigT = {};
if (fs.existsSync(USER_CONFIG_PATH)) {
  const userConfigRaw = fs.readFileSync(USER_CONFIG_PATH);
  try {
    config = JSON.parse(userConfigRaw.toString().trim()) as UserConfigT;
  } catch (e) {
    console.log(chalk.yellow(`Warning: Malformed ${USER_CONFIG_PATH}`));
  }
}

export function setUserAuthToken(authToken: string): void {
  const newConfig = {
    ...config,
    authToken: authToken,
  };
  setUserConfig(newConfig);
}

function setUserConfig(newConfig: UserConfigT): void {
  fs.writeFileSync(USER_CONFIG_PATH, JSON.stringify(newConfig));
  config = newConfig;
}
