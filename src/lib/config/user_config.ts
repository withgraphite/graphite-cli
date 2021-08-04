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
  message?: string;
};

class UserConfig {
  _data: UserConfigT;

  constructor(data: UserConfigT) {
    this._data = data;
  }

  public setAuthToken(authToken: string): void {
    this._data.authToken = authToken;
    this.save();
  }

  public getAuthToken(): string | undefined {
    return this._data.authToken;
  }

  public setBranchPrefix(branchPrefix: string): void {
    this._data.branchPrefix = branchPrefix;
    this.save();
  }

  public getBranchPrefix(): string | undefined {
    return this._data.branchPrefix;
  }

  public setMessage(message: string | undefined): void {
    this._data.message = message;
    this.save();
  }

  public getMessage(): string | undefined {
    return this._data.message;
  }

  private save(): void {
    fs.writeFileSync(USER_CONFIG_PATH, JSON.stringify(this._data));
  }
}

function readUserConfig(): UserConfig {
  if (fs.existsSync(USER_CONFIG_PATH)) {
    const userConfigRaw = fs.readFileSync(USER_CONFIG_PATH);
    try {
      const parsedConfig = JSON.parse(
        userConfigRaw.toString().trim()
      ) as UserConfigT;
      return new UserConfig(parsedConfig);
    } catch (e) {
      console.log(chalk.yellow(`Warning: Malformed ${USER_CONFIG_PATH}`));
    }
  }
  return new UserConfig({});
}

const userConfigSingleton = readUserConfig();
export default userConfigSingleton;
