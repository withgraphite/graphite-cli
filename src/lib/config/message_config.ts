import chalk from "chalk";
import fs from "fs-extra";
import os from "os";
import path from "path";

const CONFIG_NAME = ".graphite_upgrade_message";
const MESSAGE_CONFIG_PATH = path.join(os.homedir(), CONFIG_NAME);

type TMessageConfig = {
  message?: TMessage;
};

type TMessage = { contents: string; cliVersion: string };

class MessageConfig {
  _data: TMessageConfig;

  constructor(data: TMessageConfig) {
    this._data = data;
  }
  public setMessage(message: TMessage | undefined): void {
    this._data.message = message;
    this.save();
  }

  public getMessage(): TMessage | undefined {
    return this._data.message;
  }

  private save(): void {
    fs.writeFileSync(MESSAGE_CONFIG_PATH, JSON.stringify(this._data));
  }
}

function readMessageConfig(): MessageConfig {
  if (fs.existsSync(MESSAGE_CONFIG_PATH)) {
    const raw = fs.readFileSync(MESSAGE_CONFIG_PATH);
    try {
      const parsedConfig = JSON.parse(raw.toString().trim()) as TMessageConfig;
      return new MessageConfig(parsedConfig);
    } catch (e) {
      console.log(chalk.yellow(`Warning: Malformed ${MESSAGE_CONFIG_PATH}`));
    }
  }
  return new MessageConfig({});
}

const messageConfigSingleton = readMessageConfig();
export default messageConfigSingleton;
