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
  tips?: boolean;
  editor?: string;
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

  public tipsEnabled(): boolean {
    return this._data.tips ?? true;
  }

  public toggleTips(enabled: boolean): void {
    this._data.tips = enabled;
    this.save();
  }

  public getEditor(): string | undefined {
    return this._data.editor;
  }

  public setEditor(editor: string): void {
    this._data.editor = editor;
    this.save();
  }

  private save(): void {
    fs.writeFileSync(USER_CONFIG_PATH, JSON.stringify(this._data));
  }

  public path(): string {
    return USER_CONFIG_PATH;
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
