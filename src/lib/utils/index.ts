import chalk from "chalk";
import fs from "fs-extra";
import os from "os";
import path from "path";

const USER_CONFIG_PATH = path.join(os.homedir(), ".graphiteconfig");

export function makeId(length: number) {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

// TODO: validate the shape of this (possibly using retype)
export let userConfig: {
  branchPrefix?: string;
} = {};
if (fs.existsSync(USER_CONFIG_PATH)) {
  const userConfigRaw = fs.readFileSync(USER_CONFIG_PATH);
  try {
    userConfig = JSON.parse(userConfigRaw.toString().trim());
  } catch (e) {
    console.log(chalk.yellow(`Warning: Malformed ${USER_CONFIG_PATH}`));
  }
}
